const http = require('http');

const payload = {
  fullName: "John Doe",
  phone: "1234567890",
  yourStay: "Other Location",
  propertyName: "My Property",
  location: "Bangalore",
  sharingType: "2x Sharing",
  occupation: "Software Engineer",
  gender: "Male",
  lookingFor: "Any",
  qualities: "Clean, Quiet",
  budget: "15000",
  amenities: "WiFi, Gym",
  coverImage: null
};

const data = JSON.stringify(payload);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/posts',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);

  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
