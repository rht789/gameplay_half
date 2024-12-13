export const getAvatarUrl = (user) => {
  if (!user) return null;
  
  if (user.avatarUrl) {
    // If it's a full URL, return as is
    if (user.avatarUrl.startsWith('http')) {
      return user.avatarUrl;
    }
    // If it's a relative path, prepend API URL
    return `${process.env.REACT_APP_API_URL}${user.avatarUrl}`;
  }
  
  // Fallback to initial letter avatar
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`;
}; 