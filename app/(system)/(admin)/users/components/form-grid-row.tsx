import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formatPhone } from "@/components/ui/input-mask";
import z from "zod";
import { formSchema } from "./users-form.schema";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogDescription } from "@/components/ui/dialog";
import { Select } from "@radix-ui/react-select";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FieldConfig {
  name: keyof z.infer<typeof formSchema>;
  placeholder: string;
  type?: "text" | "checkbox";
  required: boolean;
}

interface FormGridRowProps {
  fields: FieldConfig[];
  form: UseFormReturn<z.infer<typeof formSchema>>;
  data: { id: string; trade_name: string }[];
}

export function FormGridRow({ fields, form, data }: FormGridRowProps) {
  return (
    <div
      className={`grid gap-4 ${
        fields.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-1"
      }`}
    >
      {fields.map((fieldConfig) => {
        const labelText = fieldConfig.required
          ? `${fieldConfig.placeholder} *`
          : fieldConfig.placeholder;

        return (
          <FormField
            key={fieldConfig.name}
            control={form.control}
            name={fieldConfig.name}
            render={({ field }) => (
              <FormItem
                className={
                  fieldConfig.type === "checkbox"
                    ? "flex items-center gap-2"
                    : ""
                }
              >
                {fieldConfig.type === "checkbox" ? (
                  <>
                    <FormControl>
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                      />
                    </FormControl>
                    <FormLabel>
                      <DialogDescription>{labelText}</DialogDescription>
                    </FormLabel>
                  </>
                ) : (
                  <FormControl>
                    {fieldConfig.name === "phone_number" ? (
                      <Input
                        placeholder={labelText}
                        value={
                          typeof field.value === "string"
                            ? formatPhone(field.value)
                            : ""
                        }
                        onChange={(e) => {
                          const onlyNumbers = e.target.value.replace(/\D/g, "");
                          field.onChange(onlyNumbers);
                        }}
                      />
                    ) : fieldConfig.name === "company" ? (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value.toString() || ""}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Lista de clientes</SelectLabel>
                            {data.map((company) => (
                              <SelectItem
                                className="hover:bg-primary/20 uppercase hover:cursor-pointer hover:transition-transform"
                                key={company.id}
                                value={company.id}
                              >
                                {company.trade_name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder={labelText}
                        value={
                          typeof field.value === "string" ? field.value : ""
                        }
                        onChange={field.onChange}
                      />
                    )}
                  </FormControl>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
      })}
    </div>
  );
}
