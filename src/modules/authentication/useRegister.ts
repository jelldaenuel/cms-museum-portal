import CMS_KEYZ from "@/lib/enum";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import authService from "./auth.service";

export default function useRegisterVisitor() {
  const queryClient = useQueryClient();

  const { isLoading: isAddingVisitor, mutateAsync: registerVisitorHandler } = useMutation({
    mutationFn: authService.registerVisitor,
    onSuccess: (responseData, variables) => {
      toast.success(
        `Success! The visitor has been created successfully.`
      );
      queryClient.invalidateQueries({
        queryKey: [CMS_KEYZ.REGISTER_VISITOR],
      });
    },
    onError: (err: any) => toast.error(err.message || "Registration failed"),
  });

  return { isAddingVisitor, registerVisitorHandler };
}
