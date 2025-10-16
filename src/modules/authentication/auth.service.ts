/* eslint-disable @typescript-eslint/no-explicit-any */
import supabase from "@/lib/supabase";
import axios from "axios";
import IAuthClient from "./auth.interface";

// Interface for visitor registration
interface RegisterVisitorPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userRole: string;
  visitorImg?: File;
}

export default {
  /**-------------------------------------------------- */
  // Login User                                         |
  /**-------------------------------------------------- */
  loginHandler: async (payload: IAuthClient) => {
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: payload.email,
        password: payload.password,
      });
  
      // If Supabase returns an auth error
      if (authError) {
        // Format the error message to be more user-friendly
        const errorMessage = authError.message || "Authentication failed";
        throw new Error(errorMessage);
      }
  
      // Check if user data exists
      if (!data?.user?.user_metadata) {
        throw new Error("User data not found");
      }
  
      return {
        id: data.user.id,
        ...data.user.user_metadata
      } as any;
    } catch (err) {
      // Handle different error types
      if (err instanceof axios.AxiosError) {
        const errorMessage = err.response?.data?.error || "Server error";
        throw new Error(errorMessage);
      }
      
      // Re-throw the error so it can be caught by the mutation
      throw err;
    }
  },
  
  /**-------------------------------------------------- */
  // Register Visitor                                   |
  /**-------------------------------------------------- */
  registerVisitor: async (payload: RegisterVisitorPayload) => {
    const formData = new FormData();
    
    Object.entries(payload).forEach(([key, value]) => {
      if (key === 'visitorImg' && value instanceof File) {
        formData.append('visitorImg', value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Log the FormData contents (for debugging)
    console.log('FormData contents:');
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await axios({
        method: "POST",
        url: `${import.meta.env.VITE_SERVER_URL}/api/v1/visitor/register_visitor`,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;

    } catch (err) {
      if (err instanceof axios.AxiosError) {
        const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Registration failed';
        console.error('Registration error:', errorMessage);
        throw new Error(errorMessage);
      }
      // IMPORTANTE: I-throw ang error para ma-catch ng React Query
      console.error('Unexpected registration error:', err);
      throw new Error('An unexpected error occurred during registration');
    }
  },

  /**-------------------------------------------------- */
  // Current User                                       |
  /**-------------------------------------------------- */
  currentUserHandler: async () => {
    try {
      const { data: session } = await supabase.auth.getSession();

      if (!session.session) return null;

      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error fetching current user:', error.message);
        return null;
      }
    
      return user;
      
    } catch (err) {
      if (err instanceof axios.AxiosError) {
        console.log(err.response?.data.error);
        throw new Error(`${err.response?.data.error}`);
      }
      // I-throw ang error
      throw err;
    }
  },

  /**-------------------------------------------------- */
  // Logout Current User                                |
  /**-------------------------------------------------- */
  logoutUserHandler: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(JSON.stringify(error, null, 2));
      }
    } catch (err) {
      if (err instanceof axios.AxiosError) {
        console.log(err.response?.data.error);
        throw new Error(`${err.response?.data.error}`);
      }
      // I-throw ang error
      throw err;
    }
  },
}
