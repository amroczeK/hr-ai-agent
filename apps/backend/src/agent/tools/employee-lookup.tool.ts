import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { VectorStoreConfig } from '../interfaces/vector-store-config.interface';

/**
 * Creates an employee lookup tool for the agent
 * @param vectorStore - The vector store configuration to use for searches
 */
export function createEmployeeLookupTool(vectorStore: VectorStoreConfig) {
  return tool(
    async ({ query, n = 10 }) => {
      console.log(
        `Employee lookup tool called with query: "${query}", n: ${n}`,
      );
      const result = await vectorStore.similaritySearch(query, n);
      return result;
    },
    {
      name: 'employee_lookup',
      description:
        'Gathers employee details from the HR database using semantic search. ' +
        'Use this tool to find employees based on skills, departments, roles, names, or any other relevant criteria.',
      schema: z.object({
        query: z
          .string()
          .describe(
            'The search query describing what you are looking for in the employee database',
          ),
        n: z
          .number()
          .optional()
          .default(10)
          .describe('Number of results to return (default: 10)'),
      }),
    },
  );
}
