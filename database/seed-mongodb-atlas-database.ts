import { OpenAIEmbeddings } from "@langchain/openai";
import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not set");
}

const client = new MongoClient(process.env.MONGODB_URI as string);

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

function loadEmployeeData(): Employee[] {
  console.log("Loading employee data from local file...");
  const dataPath = join(__dirname, "employee-data.json");
  const data = readFileSync(dataPath, "utf-8");
  return JSON.parse(data);
}

async function createEmployeeSummary(employee: Employee): Promise<string> {
  return new Promise((resolve) => {
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

    const summary = `${basicInfo}. Job: ${jobDetails}. Skills: ${skills}. Reviews: ${performanceReviews}. Location: ${workLocation}. Notes: ${notes}`;

    resolve(summary);
  });
}

async function seedDatabase(): Promise<void> {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const db = client.db("hr_database");
    const collection = db.collection("employees");

    await collection.deleteMany({});

    const syntheticData = loadEmployeeData();

    const recordsWithSummaries = await Promise.all(
      syntheticData.map(async (record) => ({
        pageContent: await createEmployeeSummary(record),
        metadata: { ...record },
      }))
    );

    for (const record of recordsWithSummaries) {
      await MongoDBAtlasVectorSearch.fromDocuments(
        [record],
        new OpenAIEmbeddings(),
        {
          collection,
          indexName: "vector_index",
          textKey: "embedding_text",
          embeddingKey: "embedding",
        }
      );

      console.log(
        "Successfully processed & saved record:",
        record.metadata.employee_id
      );
    }

    console.log("Database seeding completed");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
  }
}

seedDatabase().catch(console.error);
