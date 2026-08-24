/**
 * The application database lives in @workspace/db. This file stays as the
 * import path the slices already use, so the data layer can move without
 * touching every feature.
 */
export { appDb } from "@workspace/db"
export type * from "@workspace/db/schema"
