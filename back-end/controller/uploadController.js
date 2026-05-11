const VoterEligibilityLists = require('../model/VoterEligibilityLists');
const Election = require('../model/Election');
const User = require('../model/userModel');
const Candidate = require('../model/Candidates'); 
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const csv = require('csv-parser');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { sendEmailWithTemplate } = require('../services/emailTemplateService');
const unlinkAsync = promisify(fs.unlink);

const voterEligibilityController = {
  uploadVoterList: catchAsync(async (req, res, next) => {
    const { electionId } = req.params;
    const file = req.file;

    if (!file) {
      return next(new AppError('Please upload a file', 400));
    }
    const election = await Election.findById(electionId).select('institutionId flags').lean();
  
    if (!election) {
      await unlinkAsync(file.path);
      return next(new AppError('Election not found', 404));
    }



    const existingList = await VoterEligibilityLists.findOne({ electionId }).select('_id').lean();
    if (existingList) {
      await unlinkAsync(file.path);
      return next(new AppError('Voter list already uploaded for this election', 400));
    }

    const allowedFormats = ['.csv', '.xlsx', '.xls'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (!allowedFormats.includes(fileExt)) {
      await unlinkAsync(file.path);
      return next(new AppError('Please upload CSV or Excel file', 400));
    }

    let voters = [];
    try {
      if (fileExt === '.csv') {
        voters = await parseCSV(file.path);
      } else {
        voters = await parseExcel(file.path);
      }
    } catch (error) {
      await unlinkAsync(file.path);
      return next(new AppError('Error parsing file: ' + error.message, 400));
    }

    if (voters.length === 0) {
      await unlinkAsync(file.path);
      return next(new AppError('No valid records found in file', 400));
    }

    const { validRecords, invalidRecords } = validateVoters(voters, electionId);
    if (validRecords.length === 0) {
      await unlinkAsync(file.path);
      return next(new AppError('No valid voter records found. All records are invalid.', 400));
    }

    const institutionIdToAssign = election.institutionId;
    let usersUpdatedCount = 0;

    const userEmails = validRecords.map(v => v.email);
    const existingUsers = await User.find({
      email: { $in: userEmails },
      role: { $nin: ['electionAdmin', 'superAdmin'] }
    }).lean();

    const userUpdates = existingUsers.map(user => {
      if (!user.institutionId || user.institutionId.toString() !== institutionIdToAssign.toString()) {
        usersUpdatedCount++;
        return {
          updateOne: {
            filter: { _id: user._id },
            update: {
              $set: {
                institutionId: institutionIdToAssign,
                isEligible: true,
                voterId: validRecords.find(v => v.email === user.email)?.voterId
              }
            }
          }
        };
      }
      return null;
    }).filter(Boolean);

    if (userUpdates.length) {
      await User.bulkWrite(userUpdates);
    }
    const eligibilityList = await VoterEligibilityLists.create({
      electionId,
      institutionId: election.institutionId,
      uploadedBy: req.user.id,
      fileName: file.originalname,
      fileUrl: file.path,
      totalRecords: voters.length,
      validRecords: validRecords.length,
      invalidRecords: invalidRecords.length,
      eligibleVoters: validRecords,
      status: 'completed',
      processedAt: new Date()
    });

    await Election.findByIdAndUpdate(electionId, {
      $set: { 'statistics.totalEligibleVoters': validRecords.length }
    });
    
    await unlinkAsync(file.path);

    res.status(201).json({
      status: 'success',
      data: {
        eligibilityList: {
          _id: eligibilityList._id,
          fileName: eligibilityList.fileName,
          totalRecords: eligibilityList.totalRecords,
          validRecords: eligibilityList.validRecords,
          invalidRecords: eligibilityList.invalidRecords
        },
        summary: {
          total: voters.length,
          valid: validRecords.length,
          invalid: invalidRecords.length,
          usersUpdated: usersUpdatedCount
        },
        invalidDetails: invalidRecords.slice(0, 10)
      }
    });
  }),

  batchRegistrationStatus: catchAsync(async (req, res, next) => {
    const { electionIds } = req.body;
    const userEmail = req.user.email;
  
    if (!electionIds || !Array.isArray(electionIds)) {
      return next(new AppError('Please provide an array of election IDs', 400));
    }
  
    const voterLists = await VoterEligibilityLists.find({
      electionId: { $in: electionIds },
      'eligibleVoters.email': userEmail
    }).lean();
  
    const statusMap = {};
    voterLists.forEach(list => {
      const voter = list.eligibleVoters.find(v => v.email === userEmail);
      if (voter) {
        statusMap[list.electionId.toString()] = {
          isRegistered: voter.isRegistered || false,
          voterId: voter.voterId || null
        };
      }
    });
  
    electionIds.forEach(id => {
      if (!statusMap[id]) {
        statusMap[id] = {
          isRegistered: false,
          voterId: null
        };
      }
    });
  
    res.status(200).json({
      status: 'success',
      data: { statusMap }
    });
  }),
  
  batchNominationStatus: catchAsync(async (req, res, next) => {
    const { electionIds } = req.body;
    const userId = req.user.id;
  
    if (!electionIds || !Array.isArray(electionIds)) {
      return next(new AppError('Please provide an array of election IDs', 400));
    }
  
    const nominations = await Candidate.find({
      electionId: { $in: electionIds },
      userId,
      status: { $in: ['pending', 'approved', 'withdrawn'] }
    }).lean();
  
    const statusMap = {};
    nominations.forEach(nom => {
      statusMap[nom.electionId.toString()] = {
        hasNomination: true,
        status: nom.status,
        nominationId: nom._id
      };
    });
  
    electionIds.forEach(id => {
      if (!statusMap[id]) {
        statusMap[id] = {
          hasNomination: false,
          status: null,
          nominationId: null
        };
      }
    });
  
    res.status(200).json({
      status: 'success',
      data: { statusMap }
    });
  }),

  registerVoter: catchAsync(async (req, res, next) => {
    const { electionId } = req.params;
    const { email } = req.body;
  
    if (!email) {
      return next(new AppError('Email is required', 400));
    }

    const election = await Election.findById(electionId).lean();
    if (!election) {
      return next(new AppError('Election not found', 404));
    }
  
    const blockedStatuses = ['voting_open','results_published', 'completed'];
    if (blockedStatuses.includes(election.status)) {
      return next(new AppError('Registration is not allowed at this stage', 400));
    }
  
    if (election.status !== 'registration_open') {
      return next(new AppError(`Registration is not open for this election. Current status: ${election.status}`, 400));
    }
  
    const voterList = await VoterEligibilityLists.findOne({
      electionId,
      'eligibleVoters.email': email.toLowerCase()
    });
  
    if (!voterList) {
      return res.status(404).json({
        status: 'fail',
        message: 'Your email is not found in the voter eligibility list for this election.'
      });
    }
  
    const voterIndex = voterList.eligibleVoters.findIndex(v => v.email === email.toLowerCase());
    const voter = voterList.eligibleVoters[voterIndex];
  
    if (!voter) {
      return res.status(404).json({
        status: 'fail',
        message: 'Voter not found'
      });
    }
  
    if (voter.isRegistered) {
      return res.status(400).json({
        status: 'fail',
        message: 'You have already registered for this election. Please check your email for credentials.'
      });
    }
  
    if (!voter.voterId) {
      const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
      voter.voterId = `VTR-${randomStr}`;
    }
  
    voter.isRegistered = true;
    voter.registeredAt = new Date();
  
    await voterList.save();
  
    sendEmailWithTemplate(email, 'voterCredentials', {
      firstName: voter.firstName,
      lastName: voter.lastName,
      electionTitle: election.title,
      electionId: election.electionId,
      voterId: voter.voterId,
      electionIdForVoter: election.electionId
    }).catch(err => console.error('Email sending failed:', err));
  
    res.status(200).json({
      status: 'success',
      message: 'Successfully registered! Credentials have been sent to your email.',
      data: {
        email: voter.email,
        firstName: voter.firstName,
        lastName: voter.lastName,
        electionId: election.electionId,
        voterId: voter.voterId
      }
    });
  }),

  isRegistered: catchAsync(async (req, res, next) => {
    const { electionId } = req.params;
    const userEmail = req.user.email;

    const voterList = await VoterEligibilityLists.findOne({
      electionId,
      'eligibleVoters.email': userEmail
    }).lean();

    if (!voterList) {
      return res.status(200).json({
        status: 'success',
        data: { isRegistered: false }
      });
    }

    const voter = voterList.eligibleVoters.find(v => v.email === userEmail);

    res.status(200).json({
      status: 'success',
      data: { isRegistered: voter?.isRegistered || false }
    });
  }),

  getVoterList: catchAsync(async (req, res, next) => {
    const { electionId } = req.params;

    const voterList = await VoterEligibilityLists.findOne({ electionId })
      .populate('uploadedBy', 'firstName lastName email')
      .select('-eligibleVoters.voterId')
      .lean();

    if (!voterList) {
      return next(new AppError('Voter list not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { voterList }
    });
  }),

  getVoterDetails: catchAsync(async (req, res, next) => {
    const { electionId } = req.params;
    const { page = 1, limit = 50, search } = req.query;
  
    const query = { electionId };
  
    if (search) {
      query.$or = [
        { 'eligibleVoters.firstName': { $regex: search, $options: 'i' } },
        { 'eligibleVoters.lastName': { $regex: search, $options: 'i' } },
        { 'eligibleVoters.email': { $regex: search, $options: 'i' } },
        { 'eligibleVoters.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const voterList = await VoterEligibilityLists.findOne(query).lean();
  
    if (!voterList) {
      return next(new AppError('Voter list not found', 404));
    }
  
    const votersWithoutVoterId = voterList.eligibleVoters.map(voter => {
      const { voterId, ...rest } = voter;
      return rest;
    });
  
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedVoters = votersWithoutVoterId.slice(skip, skip + parseInt(limit));
    const totalCount = votersWithoutVoterId.length;
    const totalPages = Math.ceil(totalCount / parseInt(limit));
  
    res.status(200).json({
      status: 'success',
      results: paginatedVoters.length,
      total: totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: totalPages,
      data: { voters: paginatedVoters }
    });
  }),

  downloadTemplate: catchAsync(async (req, res, next) => {
    const template = [
      { firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '+251911234567' },
      { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '+251912345678' }
    ];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Voter Template');

    worksheet.columns = [
      { header: 'firstName', key: 'firstName', width: 20 },
      { header: 'lastName', key: 'lastName', width: 20 },
      { header: 'email', key: 'email', width: 30 },
      { header: 'phone', key: 'phone', width: 15 }
    ];

    template.forEach(row => worksheet.addRow(row));

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Disposition', 'attachment; filename=voter_template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  }),

  deleteVoterList: catchAsync(async (req, res, next) => {
    const { electionId } = req.params;
  
    const election = await Election.findById(electionId).lean();
    if (!election) {
      return next(new AppError('Election not found', 404));
    }
  
     const blockedStatuses = ['voting_open', 'registration_open','nomination_open', 'completed'];
  if (blockedStatuses.includes(election.status)) {
    return next(new AppError('Voter list  delete not allowed at this stage', 400));
  }

    if (election.status !== 'draft' || election.status !== 'result_published'   ) {
      return next(new AppError('Voter list can only be deleted when election is in DRAFT mode', 400));
    }
  
    const voterList = await VoterEligibilityLists.findOneAndDelete({ electionId });
  
    if (!voterList) {
      return next(new AppError('Voter list not found', 404));
    }
  
    await Election.findByIdAndUpdate(electionId, {
      $set: { isVoterListReady: false }
    });
  
    res.status(200).json({
      status: 'success',
      message: 'Voter list deleted successfully'
    });
  }),
  
  deleteVoter: catchAsync(async (req, res, next) => {
    const { electionId, voterId } = req.params;
  
    const election = await Election.findById(electionId).lean();
    if (!election) {
      return next(new AppError('Election not found', 404));
    }
  

    const blockedStatuses = ['voting_open', 'registration_open','nomination_open', 'completed'];
    if (blockedStatuses.includes(election.status)) {
      return next(new AppError('Voters delete not allowed at this stage', 400));
    }
  
    const voterList = await VoterEligibilityLists.findOne({ electionId });
    if (!voterList) {
      return next(new AppError('Voter list not found', 404));
    }
  
    const voter = voterList.eligibleVoters.find(v => v._id.toString() === voterId);
    if (!voter) {
      return next(new AppError('Voter not found', 404));
    }
  
    if (voter.isRegistered === true) {
      return next(new AppError('Cannot delete voter who has already registered', 400));
    }
  
    if (voter.hasVoted === true) {
      return next(new AppError('Cannot delete voter who has already voted', 400));
    }
  
    const voterIndex = voterList.eligibleVoters.findIndex(v => v._id.toString() === voterId);
    voterList.eligibleVoters.splice(voterIndex, 1);
    voterList.totalRecords--;
    voterList.validRecords--;
    await voterList.save();
  
    res.status(200).json({
      status: 'success',
      message: 'Voter deleted successfully'
    });
  }),

  
  checkEligibility: catchAsync(async (req, res, next) => {
    const { electionId, email } = req.params;

    const voterList = await VoterEligibilityLists.findOne({
      electionId,
      'eligibleVoters.email': email.toLowerCase()
    }).lean();

    if (!voterList) {
      return res.status(200).json({
        status: 'success',
        data: { isEligible: false }
      });
    }

    const voter = voterList.eligibleVoters.find(v => v.email === email.toLowerCase());

    res.status(200).json({
      status: 'success',
      data: {
        isEligible: true,
        voterId: voter?.voterId,
        hasVoted: voter?.hasVoted || false
      }
    });
  }),

  addVoter: catchAsync(async (req, res, next) => {
    const { electionId } = req.params;
    const { firstName, lastName, email, phone } = req.body;
  
    const voterList = await VoterEligibilityLists.findOne({ electionId });
    if (!voterList) {
      return next(new AppError('Voter list not found', 404));
    }
  
    const existing = voterList.eligibleVoters.find(v => v.email === email);
    if (existing) {
      return next(new AppError('Voter with this email already exists', 400));
    }
  
    const newVoter = {
      firstName,
      lastName,
      email,
      phone: phone || '',
      electionId,
      voterId: `VOTER-${firstName}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      isRegistered: false,
      isVerified: false,
      hasVoted: false
    };
  
    voterList.eligibleVoters.push(newVoter);
    voterList.totalRecords++;
    voterList.validRecords++;
    await voterList.save();
  
    res.status(201).json({
      status: 'success',
      data: newVoter
    });
  }),
  
  updateVoter: catchAsync(async (req, res, next) => {
    const { electionId, voterId } = req.params;
    const { firstName, lastName, email, phone } = req.body;
  
    const voterList = await VoterEligibilityLists.findOne({ electionId });
    if (!voterList) {
      return next(new AppError('Voter list not found', 404));
    }
  
    const voterIndex = voterList.eligibleVoters.findIndex(v => v._id.toString() === voterId);
    if (voterIndex === -1) {
      return next(new AppError('Voter not found', 404));
    }
  
    if (firstName) voterList.eligibleVoters[voterIndex].firstName = firstName;
    if (lastName) voterList.eligibleVoters[voterIndex].lastName = lastName;
    if (email) voterList.eligibleVoters[voterIndex].email = email;
    if (phone) voterList.eligibleVoters[voterIndex].phone = phone;
  
    await voterList.save();
  
    res.status(200).json({
      status: 'success',
      data: voterList.eligibleVoters[voterIndex]
    });
  }),

};





const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        const cleanedData = {};
        for (const [key, value] of Object.entries(data)) {
          cleanedData[key] = value ? String(value) : '';
        }
        results.push(cleanedData);
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

const parseExcel = async (filePath) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new Error('No worksheet found');
  }

  const rows = [];
  const headers = [];

  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    headers[colNumber] = cell.value;
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const rowData = {};
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber];
      if (header) {
        let cellValue = cell.value;
        if (cellValue && typeof cellValue === 'object') {
          cellValue = cellValue.text || cellValue.hyperlink || String(cellValue);
        } else if (cellValue !== null && cellValue !== undefined) {
          cellValue = String(cellValue);
        }
        rowData[header] = cellValue;
      }
    });

    if (Object.keys(rowData).length > 0) {
      rows.push(rowData);
    }
  });

  return rows;
};

const validateVoters = (voters, electionId) => {
  const validRecords = [];
  const invalidRecords = [];
  const emailSet = new Set();

  voters.forEach((voter, index) => {
    const requiredFields = ['firstName', 'lastName', 'email'];
    const missingFields = requiredFields.filter(field => !voter[field]);

    if (missingFields.length > 0) {
      invalidRecords.push({ row: index + 2, reason: `Missing: ${missingFields.join(', ')}` });
      return;
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(voter.email)) {
      invalidRecords.push({ row: index + 2, reason: 'Invalid email format' });
      return;
    }

    if (emailSet.has(voter.email.toLowerCase())) {
      invalidRecords.push({ row: index + 2, reason: 'Duplicate email' });
      return;
    }

    emailSet.add(voter.email.toLowerCase());

    validRecords.push({
      firstName: voter.firstName.trim(),
      lastName: voter.lastName.trim(),
      email: voter.email.toLowerCase().trim(),
      phone: voter.phone ? voter.phone.toString().trim() : '',
      electionId: electionId,
      voterId: `VOTER-${voter.firstName.trim()}-${Math.random().toString(36).substr(2, 6)}-${index}`,
      isRegistered: false,
      isVerified: false,
      hasVoted: false
    });
  });

  return { validRecords, invalidRecords };
};

module.exports = voterEligibilityController;