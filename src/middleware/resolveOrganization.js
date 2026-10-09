const resolveOrganization = (req, res, next) => {
  const orgHeader = req.headers['x-organization-id'];
  const orgParam = req.params.organizationId;
  const orgQuery = req.query.organizationId;

  const organizationId = orgHeader || orgParam || orgQuery;

  if (!organizationId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required in headers (x-organization-id), params, or query.',
    });
  }

  req.organizationId = organizationId;
  next();
};

module.exports = resolveOrganization;
