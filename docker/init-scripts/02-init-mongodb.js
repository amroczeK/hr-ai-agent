// MongoDB initialization script
// This script runs when the MongoDB container is first created

// Switch to the hr_database
db = db.getSiblingDB('hr_database');

// Create the employees collection (if it doesn't exist)
db.createCollection('employees');

// Create a simple index on the name field for basic queries
db.employees.createIndex({ "name": 1 });

print('MongoDB initialization complete');
print('Note: Vector search indexes must be created manually in MongoDB Atlas');

