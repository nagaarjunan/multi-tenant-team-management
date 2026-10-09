const validateRegisterInput = (data = {}) => {
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    return { isValid: false, message: 'Valid name is required.' };
  }
  if (!data.email || typeof data.email !== 'string' || !/^\S+@\S+\.\S+$/.test(data.email)) {
    return { isValid: false, message: 'Valid email address is required.' };
  }
  if (!data.password || typeof data.password !== 'string' || data.password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long.' };
  }
  return { isValid: true };
};

const validateLoginInput = (data = {}) => {
  if (!data.email || typeof data.email !== 'string') {
    return { isValid: false, message: 'Email is required.' };
  }
  if (!data.password || typeof data.password !== 'string') {
    return { isValid: false, message: 'Password is required.' };
  }
  return { isValid: true };
};

module.exports = {
  validateRegisterInput,
  validateLoginInput,
};
