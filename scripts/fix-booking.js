const fs = require('fs');

let content = fs.readFileSync('components/ServicesPage.js', 'utf8');

const stratIndex = content.indexOf('const fetchAvailableTimeSlots = async (date) => {');
const endIndex = content.indexOf('const handleBookingSubmit = async (e) => {');

const replacement = `const fetchAvailableTimeSlots = async (date) => {
    setIsLoading(true);
    setAvailableTimeSlots([]);
    setBookingError('Coming Soon');
    setIsLoading(false);
  };

  `;

content = content.substring(0, stratIndex) + replacement + content.substring(endIndex);
fs.writeFileSync('components/ServicesPage.js', content);
console.log('Updated fetchAvailableTimeSlots');
