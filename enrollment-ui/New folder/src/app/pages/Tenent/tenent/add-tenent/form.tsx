import { BreadcrumbItem, Breadcrumbs } from "@/components/shared/Breadcrumbs";
import FormLayout from "@/components/shared/form/FormLayout";
import { Button, Input } from "@/components/ui";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, } from "react-hook-form";
import { schema } from "./schema";

const Form = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },

    } = useForm({
        resolver: yupResolver(schema),
    });


    const onSubmit = () => {
    };


const breadcrumbs: BreadcrumbItem[] = [
  { title: "Tenent", path: "/tenent-management/tenent" },
];

    return (
            <FormLayout onSubmit={handleSubmit(onSubmit)} FormClassName="transition-content w-full px-2 pt-5 lg:pt-2">
                <div className="min-w-0">
          <Breadcrumbs items={breadcrumbs} className="max-sm:hidden mb-4" />

                {/* <h1>Branch Details</h1> */}
                <div className="bg-linear-to-br from-primary/10 via-primary/5 to-background rounded-xl border border-primary/20 p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
                    <BuildingOfficeIcon className="w-5 h-5 text-blue-500" />
                    Tenent Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                   <Input
                        label="Tenent Name"
                        placeholder="Enter Tenent Name"
                        prefix={
                            <BuildingOfficeIcon className="size-5 transition-colors duration-200" strokeWidth="1" />
                        }
                        {...register("tenentName")}
                        error={errors?.tenentName?.message}
                    />

                    <Input
                        label="Display Order"
                        placeholder="Enter Display Order"
                        prefix={
                            <BuildingOfficeIcon className="size-5 transition-colors duration-200" strokeWidth="1" />
                        }
                        {...register("dispalyOrder")}
                        error={errors?.dispalyOrder?.message}
                    />

                    <Input
                        label="Region"
                        placeholder="Enter Region"
                        prefix={
                            <BuildingOfficeIcon className="size-5 transition-colors duration-200" strokeWidth="1" />
                        }
                        {...register("region")}
                        error={errors?.region?.message}
                    />

                     <Input
                        label="Shared Key"
                        placeholder="Enter Display Order"
                        prefix={
                            <BuildingOfficeIcon className="size-5 transition-colors duration-200" strokeWidth="1" />
                        }
                        {...register("shardKey")}
                        error={errors?.shardKey?.message}
                    />

                   </div> 
                </div>
                <div className="w-full flex justify-end items-center mb-4">
                    <Button type="submit" className="mt-5 w-20" color="primary">
                        Submit
                    </Button>
                </div>
                </div>
            </FormLayout>

    )
}
export default Form