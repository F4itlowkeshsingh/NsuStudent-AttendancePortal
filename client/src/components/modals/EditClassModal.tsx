import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertClassSchema, type Class } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: Class;
}

// Extend zod schema for form validation
const classSchema = insertClassSchema.extend({
  name: z.string().min(1, "Class name is required"),
});

type ClassFormValues = z.infer<typeof classSchema>;

export function EditClassModal({ isOpen, onClose, classData }: EditClassModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  // Form with default values from class
  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: classData.name,
      department: classData.department || "",
      subject: classData.subject || "",
      semester: classData.semester || 0,
    },
  });

  const updateClassMutation = useMutation({
    mutationFn: async (data: ClassFormValues) => {
      return fetch(`/api/classes/${classData.id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to update class');
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      toast({
        title: "Success",
        description: "Class updated successfully",
      });
      onClose();
    },
    onError: (error) => {
      console.error("Error updating class:", error);
      toast({
        title: "Error",
        description: "Failed to update class",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ClassFormValues) => {
    setIsPending(true);
    updateClassMutation.mutate(data, {
      onSettled: () => setIsPending(false),
    });
  };

  const handleDeleteClass = () => {
    if (confirm("Are you sure you want to delete this class? This action cannot be undone.")) {
      setIsPending(true);
      fetch(`/api/classes/${classData.id}`, { 
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(data => {
              throw new Error(data.message || 'Failed to delete class');
            });
          }
          return response.json();
        })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
          toast({
            title: "Success",
            description: "Class deleted successfully",
          });
          onClose();
        })
        .catch((error) => {
          console.error("Error deleting class:", error);
          
          toast({
            title: "Error",
            description: error.message || "Failed to delete class",
            variant: "destructive",
          });
        })
        .finally(() => setIsPending(false));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Class</DialogTitle>
          <DialogDescription>
            Update class information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter class name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Computer Science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Database Management" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="semester"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semester (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. 4" 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-between">
              <Button 
                variant="destructive" 
                type="button" 
                onClick={handleDeleteClass}
                disabled={isPending}
              >
                Delete
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}