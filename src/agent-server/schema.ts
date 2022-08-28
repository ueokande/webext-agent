import { Static, Type } from "@sinclair/typebox";

// The requestSchema defines a schema of request body to represent
// WebExtensions API in JSON such as the following:
//
//   {
//     "args": [
//       {
//         "currentWindow": true
//       }
//     ]
//   }
export const RequestSchema = Type.Object({
  args: Type.Array(Type.Any()),
});

export type RequestType = Static<typeof RequestSchema>;

// ResponseSchema represents API's response
export const ResponseSchema = Type.Any();

export type ResponseType = Static<typeof ResponseSchema>;

// ErrorSchema represents server and API erreors
export const ErrorSchema = Type.Object({
  message: Type.String(),
});

export type ErrorType = Static<typeof ErrorSchema>;
