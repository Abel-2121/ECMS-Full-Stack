module.exports = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    console.log("Error MeSsage ",message)
    console.log("Error  ",err)
    res.status(statusCode).json({
      success: false,
      message
    });
  };
  