// frontend/src/api/userApiSlice.js
import { apiSlice } from "./apiSlice";
import { setCredentials } from "../features/authSlice";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => "/user/profile",
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ ...data }));
        } catch (err) {
          console.log(err);
        }
      },
    }),
  }),
});

export const { useGetProfileQuery } = userApiSlice;
