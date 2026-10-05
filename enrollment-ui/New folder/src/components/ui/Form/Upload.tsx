// Import Dependencies
import { useMergedRef } from "@/hooks";
import {
  useRef,
  InputHTMLAttributes,
  ReactNode,
  ChangeEvent,
  forwardRef,
} from "react";
import { toast } from "sonner";

interface UploadProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "hidden" | "onChange" | "children"
  > {
  onChange?: (file: File[]) => void;
  children: (props: any) => ReactNode;
  disabled?: boolean;
  inputProps?: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "hidden" | "ref"
  >;
}

// ----------------------------------------------------------------------

const Upload = forwardRef<HTMLInputElement, UploadProps>((props, ref) => {
  const {
    onChange = () => { },
    children,
    accept,
    name,
    form,
    disabled,
    capture,
    inputProps,
    ...rest
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);

  const onClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };



  const MAX_IMAGE_SIZE = 1024 * 1024;

  const getAcceptedTypes = (accept?: string) =>
    accept?.split(",").map((type) => type.trim()) ?? [];

  const isImageAccepted = (acceptedTypes: string[]) =>
    acceptedTypes.some(
      (type) =>
        type === "image/*" ||
        type.startsWith("image/") ||
        [".jpg", ".jpeg", ".png", ".webp"].some((ext) =>
          type.startsWith(ext)
        )
    );

  const isPdfAccepted = (acceptedTypes: string[]) =>
    acceptedTypes.some(
      (type) => type === "application/pdf" || type === ".pdf"
    );

  const isValidType = (file: File, acceptedTypes: string[]) =>
    acceptedTypes.some((type) => {
      if (type.endsWith("/*")) {
        return file.type.startsWith(type.replace("/*", "/"));
      }

      if (type.startsWith(".")) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }

      return file.type === type;
    });

  const showInvalidTypeError = (
    acceptsImage: boolean,
    acceptsPdf: boolean
  ) => {
    const message = acceptsImage
      ? "Please select a valid image file"
      : acceptsPdf
        ? "Please select a valid PDF file"
        : "Please select a valid file";

    toast.error(message, {
      position: "top-right",
      duration: 5000,
    });
  };

  const validateFiles = (
    files: File[],
    acceptedTypes: string[],
    input: HTMLInputElement
  ) => {
    const acceptsImage = isImageAccepted(acceptedTypes);
    const acceptsPdf = isPdfAccepted(acceptedTypes);

    for (const file of files) {
      if (!isValidType(file, acceptedTypes)) {
        showInvalidTypeError(acceptsImage, acceptsPdf);
        input.value = "";
        return false;
      }

      if (
        acceptsImage &&
        file.type.startsWith("image/") &&
        file.size > MAX_IMAGE_SIZE
      ) {
        toast.error("Image size must be less than 1 MB", {
          position: "top-right",
          duration: 5000,
        });

        input.value = "";
        return false;
      }
    }

    return true;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files;

    if (!files?.length) {
      return;
    }

    const fileArray = Array.from(files);

    if (accept) {
      const acceptedTypes = getAcceptedTypes(accept);

      if (
        !validateFiles(
          fileArray,
          acceptedTypes,
          event.currentTarget
        )
      ) {
        return;
      }
    }

    onChange(fileArray);
    event.currentTarget.value = "";
  };

  const mergedRef = useMergedRef(ref, inputRef);

  return (
    <>
      {children({ onClick, disabled, ...rest })}

      <input
        hidden
        type="file"
        accept={accept}
        onChange={handleChange}
        ref={mergedRef}
        name={name}
        form={form}
        capture={capture}
        disabled={disabled}
        {...inputProps}
      />
    </>
  );
});

Upload.displayName = "Upload";

export { Upload };
