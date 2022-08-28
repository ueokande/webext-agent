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

// The schema defines a schema of response body to represent a result from
// WebExtensions API in JSON such as the following:
//
//   {
//     "result": [
//       {
//         "id": 10,
//         "title": "foo",
//         "url": "https://example.com/",
//         "active": true
//       },
//       {
//         "id": 10,
//         "title": "foo",
//         "url": "https://example.net/",
//         "active": false
//       }
//     ]
//   }
//
// If the WebExtensions API returns an errors; the request body is the following:
//
//   {
//     "error": {
//       "message": "An error occurs"
//     }
//   }
//

export const ResponseSchema = Type.Union([
  Type.Object({
    result: Type.Any(),
  }),
  Type.Object({
    error: Type.Object({
      message: Type.String(),
    }),
  }),
]);

export type ResponseType = Static<typeof ResponseSchema>;

// ErrorSchema servers erreor
export const ErrorSchema = Type.Object({
  message: Type.String(),
});

export type ErrorType = Static<typeof ErrorSchema>;
