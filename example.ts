import { Injectable } from "@nestjs/common";
import { convertToModelMessages, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { ICurrentUser, ProductFilter } from "src/common/constants";
import { UIMessage } from "ai";
import { ProductsService } from "src/ecommerce/products.service";

@Injectable()
export class AiService {
  constructor(private readonly productsService: ProductsService) {}

  async getAiResponse(
    messages: UIMessage[],
    currentUser: ICurrentUser,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ text: string; data: any[] }> {
    const systemPrompt = `
You are an interactive assistant for an e-commerce platform that helps users find products or answer general questions. Your task is to interpret the user's query and conversation history, then return a JSON object with two fields:
- \`text\`: A conversational response to display in the chatbox (e.g., "Here are the electronics products you requested" or "Can you clarify what you mean?").
- \`filter\`: A product filter object (conforming to the schema below) if the query is product-related; otherwise, an empty object {}.

The product filter schema is:
{
  name?: string; // Partial match for product name
  description?: string; // Partial match for product description
  category?: string; // Exact match for category (e.g., 'Electronics', 'Clothing', 'Others')
  location?: { city?: string; province?: string; address?: string }; // Location filters
  price?: { min?: number; max?: number }; // Price range in SLE
  variants?: { name: string; values: string[] }[]; // e.g., [{ name: 'Color', values: ['Red'] }]
  sizes?: string[]; // e.g., ['S', 'M', 'L']
  affiliated?: boolean; // true for affiliated, false for non-affiliated
  type?: 'order' | 'preorder'; // Product type
  available?: boolean; // true for available, false for unavailable
  rating?: { min?: number }; // Minimum rating (0.0 to 5.0)
  quantity?: { min?: number }; // Minimum stock quantity
  preOrderDate?: { start?: string; end?: string }; // ISO date strings for pre-order date range
  viewsCount?: { min?: number }; // Minimum views count
}

Valid categories are: Electronics, Clothing, Home & Kitchen, Books, Sports & Outdoors, Beauty & Personal Care, Health & Wellness, Jewelry & Accessories, Toys & Games, Baby & Kids, Automotive, Pet Supplies, Office & School Supplies, Food & Grocery, Furniture, Appliances, Tools & Home Improvement, Arts & Crafts, Luggage & Travel Gear, Others.

Valid provinces are: Northern Province, Eastern Province, Southern Province, Western Urban, Western Rural.

Rules:
1. If the query is product-related (e.g., "electronics in Freetown under 500"), generate a \`filter\` object with relevant fields and a \`text\` response like "Here are the matching products".
2. If the query is unrelated to products (e.g., "What's the weather?"), set \`filter\` to {} and provide a conversational \`text\` response.
3. Only include filter fields relevant to the query. Omit fields not mentioned or implied.
4. For ambiguous queries, make reasonable assumptions (e.g., 'cheap' means price.max = 100).
5. For location, prioritize province or city; use address only if specific.
6. For variants, infer 'Color' or 'Material' (e.g., 'red shirt' implies Color: ['Red']).
7. For sizes, use standard sizes (S, M, L, XL) or 'One Size'.
8. For price, assume SLE currency and parse ranges (e.g., 'under 500' means price.max = 500).
9. For preOrderDate, use ISO 8601 format (e.g., '2025-10-01T00:00:00Z').
10. Use conversation context to refine filters or responses for follow-up queries (e.g., "show more electronics").
11. Keep the \`text\` response concise, friendly, and suitable for a chatbox.
`;

    const schema = z.object({
      text: z.string(),
      filter: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        category: z
          .string()
          .optional()
          .refine(
            (val) =>
              !val ||
              [
                "Electronics",
                "Clothing",
                "Home & Kitchen",
                "Books",
                "Sports & Outdoors",
                "Beauty & Personal Care",
                "Health & Wellness",
                "Jewelry & Accessories",
                "Toys & Games",
                "Baby & Kids",
                "Automotive",
                "Pet Supplies",
                "Office & School Supplies",
                "Food & Grocery",
                "Furniture",
                "Appliances",
                "Tools & Home Improvement",
                "Arts & Crafts",
                "Luggage & Travel Gear",
                "Others",
              ].includes(val),
            { message: "Invalid category" },
          ),
        location: z
          .object({
            city: z.string().optional(),
            province: z.string().optional(),
            address: z.string().optional(),
          })
          .optional(),
        price: z
          .object({
            min: z.number().optional(),
            max: z.number().optional(),
          })
          .optional(),
        variants: z
          .array(
            z.object({
              name: z.string(),
              values: z.array(z.string()),
            }),
          )
          .optional(),
        sizes: z.array(z.string()).optional(),
        affiliated: z.boolean().optional(),
        type: z.enum(["order", "preorder"]).optional(),
        available: z.boolean().optional(),
        rating: z.object({ min: z.number().optional() }).optional(),
        quantity: z.object({ min: z.number().optional() }).optional(),
        preOrderDate: z
          .object({
            start: z.string().datetime().optional(),
            end: z.string().datetime().optional(),
          })
          .optional(),
        viewsCount: z.object({ min: z.number().optional() }).optional(),
      }),
    });

    try {
      const result = await generateObject({
        model: google("gemini-2.5-flash-lite"),
        system: systemPrompt,
        messages: convertToModelMessages(messages),
        schema,
        output: "object",
      });

      const { text, filter } = result.object;

      // Initialize response
      const response: { text: string; data: any[] } = { text, data: [] };

      // If filter is not empty, query products
      if (Object.keys(filter).length > 0) {
        const productFilter: ProductFilter = filter;
        if (filter.preOrderDate) {
          const { start, end } = filter.preOrderDate;
          productFilter.preOrderDate = {
            start: start ? start : undefined,
            end: end ? end : undefined,
          };
        }

        const productsResult = await this.productsService.findAllAIProducts(
          productFilter,
          page,
          limit,
        );

        response.data = [
          {
            products: productsResult.data,
            metadata: productsResult.metadata,
          },
        ];

        // Update text if no products are found
        if (productsResult.data.length === 0) {
          response.text = "No products found matching your criteria.";
        }
      }

      return response;
    } catch (error) {
      return {
        text: `Sorry, I encountered an issue processing your request.`,
        data: [],
      };
    }
  }
}
