const fs = require('fs');

let content = fs.readFileSync('components/ServicesPage.js', 'utf-8');

// Replace prices
content = content.replace(/price:\s*'(From\s)?\$[\d,]+\.?[0-9]{0,2}'/g, "price: 'Contact Us'");
content = content.replace(/price:\s*'\$[\d,]+\.?[0-9]{0,2}'/g, "price: 'Contact Us'");
content = content.replace(/price:\s*'Contact For Price'/g, "price: 'Contact Us'");
content = content.replace(/price:\s*'£[\d,]+\.?[0-9]{0,2}'/g, "price: 'Contact Us'");
content = content.replace(/price:\s*'\$[\d,]+\+?'/g, "price: 'Contact Us'");
content = content.replace(/price:\s*'From \$[\d,]+'/g, "price: 'Contact Us'");

// Replacing package names in objects and descriptions
const replacements = [
    ['PRECISION PACKAGE', 'PREMIUM PACKAGE'],
    ['GOLD PACKAGE', 'STANDARD PACKAGE'],
    ['BRONZE PACKAGE', 'BASIC PACKAGE'],
    ['CERAMIC PRO GOLD PACKAGE', 'PREMIUM CERAMIC PACKAGE'],
    ['CERAMIC PRO SILVER PACKAGE', 'STANDARD CERAMIC PACKAGE'],
    ['CERAMIC PRO BRONZE PACKAGE', 'BASIC CERAMIC PACKAGE'],
    ['CERAMIC PRO SPORT PACKAGE', 'ENTRY CERAMIC PACKAGE'],
    ['Precision Auto Centre', 'Protomotive'],
    ['Precision Auto Center', 'Protomotive'],
    ['precision auto center', 'protomotive'],
    ['precision auto centre', 'protomotive']
];

replacements.forEach(([oldStr, newStr]) => {
    content = content.split(oldStr).join(newStr);
});

fs.writeFileSync('components/ServicesPage.js', content);
console.log('Done ServicesPage.js');

// Also update public/js/services.js
if (fs.existsSync('public/js/services.js')) {
  let contentJS = fs.readFileSync('public/js/services.js', 'utf-8');
  contentJS = contentJS.replace(/price:\s*'(From\s)?\$[\d,]+\.?[0-9]{0,2}'/g, "price: 'Contact Us'");
  contentJS = contentJS.replace(/price:\s*'\$[\d,]+\.?[0-9]{0,2}'/g, "price: 'Contact Us'");
  replacements.forEach(([oldStr, newStr]) => {
      contentJS = contentJS.split(oldStr).join(newStr);
  });
  fs.writeFileSync('public/js/services.js', contentJS);
  console.log('Done public/js/services.js');
}

// HomePage.js text replacement
if (fs.existsSync('components/HomePage.js')) {
    let contentHome = fs.readFileSync('components/HomePage.js', 'utf-8');
    replacements.forEach(([oldStr, newStr]) => {
        contentHome = contentHome.split(oldStr).join(newStr);
    });
    fs.writeFileSync('components/HomePage.js', contentHome);
    console.log('Done components/HomePage.js');
}

// Additional minor pages
const pagesToUpdate = ['components/HeaderSimple.js', 'components/Footer.js', 'pages/api/book-appointment.js', 'pages/api/send-contact-message.js', 'pages/api/calendar-feed/[adminId].js'];

pagesToUpdate.forEach(page => {
  if (fs.existsSync(page)) {
    let pageContent = fs.readFileSync(page, 'utf-8');
    replacements.forEach(([oldStr, newStr]) => {
        pageContent = pageContent.split(oldStr).join(newStr);
    });
    fs.writeFileSync(page, pageContent);
    console.log('Done ' + page);
  }
});
