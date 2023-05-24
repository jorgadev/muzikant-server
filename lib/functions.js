const clearUserData = (user) => {
  return {
    id: user._id.toHexString(),
    username: user.username,
    role: user.role,
    character: user.character,
    coins: user.coins,
    experience: user.experience,
  };
};

const convertToSlug = (str) => {
  return str.replace(/\s+/g, "-").toLowerCase();
};

module.exports = {
  clearUserData,
  convertToSlug,
};
