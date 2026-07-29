/** Builds the multipart contract expected by the Java create/update endpoints. */
export function toMultipartFormData<T extends object>(
  data: T,
  file?: File | null,
): FormData {
  const formData = new FormData();
  formData.append(
    "data",
    new Blob([JSON.stringify(data)], { type: "application/json" }),
  );

  if (file) {
    formData.append("file", file);
  }

  return formData;
}
