import { Navigate, useParams } from "react-router";
import {
  PROVIDERS_LIST_PATH,
  providerDetailDefaultPath,
} from "../utils/providersPaths";

/** `.../providers/:id` → same URL with `/provider-details`. */
export default function ProviderHospitalDetailRedirect() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Navigate to={PROVIDERS_LIST_PATH} replace />;
  }

  return <Navigate to={providerDetailDefaultPath(id)} replace />;
}
