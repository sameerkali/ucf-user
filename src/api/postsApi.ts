import { apiSlice } from "./apiSlice";

export const postsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query<any[], void>({
      query: () => "posts",
      providesTags: ["Post"],
      keepUnusedDataFor: 3600,
    }),

    addPost: builder.mutation<any,{ title: string; body: string; userId: number }>({
      query: (newPost) => ({
        url: "posts",
        method: "POST",
        body: newPost,
      }),
      invalidatesTags: ["Post"],
    }),
  }),
});

export const { useGetPostsQuery, useAddPostMutation } = postsApi;
