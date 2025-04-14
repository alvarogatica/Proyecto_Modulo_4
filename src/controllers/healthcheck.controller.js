const healthcheck = (req, res) => {
    res.send('Health Check OK!');
};

module.exports = {
    healthcheck,
};