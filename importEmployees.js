const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Define your MongoDB URI and database name
const MONGO_URI = 'mongodb+srv://joshipankaj70451:pankaj1011@cluster0.yq99ce1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Replace with your MongoDB URI
const DATABASE_NAME = 'test'; // Replace with your database name

// Define the Employee schema and model
const employeeSchema = new mongoose.Schema({
  name: String,
  designation: String,
  employeeId: { type: String, unique: true }, // Ensure employeeId is unique
  age: Number,
  descriptor: [Number] // Array of numbers for face descriptors
}, { collection: 'employees' });

const Employee = mongoose.model('Employee', employeeSchema);

// Connect to MongoDB
mongoose.connect(`${MONGO_URI}/${DATABASE_NAME}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});

// Read employees.json
const filePath = path.join(__dirname, 'employeeDescriptor.json');
fs.readFile(filePath, 'utf8', async (err, data) => {
  if (err) {
    console.error('Error reading file', err);
    return;
  }

  const employees = JSON.parse(data);

  try {
    // Find existing employee IDs in the database
    const existingEmployees = await Employee.find({}, 'employeeId').lean();
    const existingEmployeeIds = new Set(existingEmployees.map(emp => emp.employeeId));

    // Filter out duplicates based on employeeId
    const uniqueEmployees = employees.filter(emp => !existingEmployeeIds.has(emp.employeeId));

    if (uniqueEmployees.length === 0) {
      console.log('No new data to insert. All entries are duplicates.');
      return;
    }

    // Insert new unique data into MongoDB
    await Employee.insertMany(uniqueEmployees);
    console.log('Data successfully imported into MongoDB');
  } catch (err) {
    console.error('Error inserting data into MongoDB', err);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
});
