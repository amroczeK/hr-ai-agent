export interface VectorStoreConfig {
  /**
   * Perform a similarity search in the vector store
   * @param query - The search query
   * @param k - Number of results to return
   * @returns Search results as a JSON string
   */
  similaritySearch(query: string, k: number): Promise<string>;
}
