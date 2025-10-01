import { OpenAIEmbeddings } from "@langchain/openai";
import { Pool } from "pg";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Employee {
  employee_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  contact_details: {
    email: string;
    phone_number: string;
  };
  job_details: {
    job_title: string;
    department: string;
    hire_date: string;
    employment_type: string;
    salary: number;
    currency: string;
  };
  work_location: {
    nearest_office: string;
    is_remote: boolean;
  };
  reporting_manager: string | null;
  skills: string[];
  performance_reviews: Array<{
    review_date: string;
    rating: number;
    comments: string;
  }>;
  benefits: {
    health_insurance: string;
    retirement_plan: string;
    paid_time_off: number;
  };
  emergency_contact: {
    name: string;
    relationship: string;
    phone_number: string;
  };
  notes: string;
}

const pool = new Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
  database: process.env.POSTGRES_DB || "hr_database",
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "postgres",
});

function loadEmployeeData(): Employee[] {
  console.log("Loading employee data from local file...");
  const dataPath = join(__dirname, "employee-data.json");
  const data = readFileSync(dataPath, "utf-8");
  return JSON.parse(data);
}

function createEmployeeSummary(employee: Employee): string {
  const jobDetails = `${employee.job_details.job_title} in ${employee.job_details.department}`;
  const skills = employee.skills.join(", ");
  const performanceReviews = employee.performance_reviews
    .map(
      (review) =>
        `Rated ${review.rating} on ${review.review_date}: ${review.comments}`
    )
    .join(" ");
  const basicInfo = `${employee.first_name} ${employee.last_name}, born on ${employee.date_of_birth}`;
  const workLocation = `Works at ${employee.work_location.nearest_office}, Remote: ${employee.work_location.is_remote}`;
  const notes = employee.notes;

  return `${basicInfo}. Job: ${jobDetails}. Skills: ${skills}. Reviews: ${performanceReviews}. Location: ${workLocation}. Notes: ${notes}`;
}

async function initializeDatabase(): Promise<void> {
  console.log("Initializing database schema...");

  // Enable pgvector extension if not already enabled
  await pool.query("CREATE EXTENSION IF NOT EXISTS vector;");

  // Drop existing table if it exists
  await pool.query("DROP TABLE IF EXISTS employees;");

  // Create employees table
  await pool.query(`
    CREATE TABLE employees (
      id SERIAL PRIMARY KEY,
      embedding_text TEXT NOT NULL,
      embedding vector(1536),
      metadata JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Database schema created successfully");
}

async function seedDatabase(): Promise<void> {
  const client = await pool.connect();

  try {
    console.log("Connected to PostgreSQL database");

    // Initialize database schema
    await initializeDatabase();

    // Load employee data
    const employees = loadEmployeeData();

    // Initialize OpenAI embeddings
    const embeddings = new OpenAIEmbeddings();

    console.log(`Processing ${employees.length} employee records...`);

    for (const employee of employees) {
      // Create summary text for embedding
      const summaryText = createEmployeeSummary(employee);

      // Generate embedding
      console.log(`Generating embedding for ${employee.employee_id}...`);
      const embeddingVector = await embeddings.embedQuery(summaryText);

      // Insert into database
      await client.query(
        `INSERT INTO employees (embedding_text, embedding, metadata) 
         VALUES ($1, $2, $3)`,
        [
          summaryText,
          `[${embeddingVector.join(",")}]`,
          JSON.stringify(employee),
        ]
      );

      console.log(
        `Successfully processed & saved record: ${employee.employee_id}`
      );
    }

    // Create indexes for better performance
    console.log("Creating indexes...");

    await client.query(`
      CREATE INDEX ON employees USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);
    `);

    await client.query(`
      CREATE INDEX idx_employees_metadata ON employees USING GIN (metadata);
    `);

    console.log("Indexes created successfully");

    // Display summary
    const result = await client.query("SELECT COUNT(*) FROM employees");
    console.log(`\nDatabase seeding completed successfully!`);
    console.log(`Total records inserted: ${result.rows[0].count}`);
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seeding script
seedDatabase().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
