import { Navigate, useParams } from "react-router-dom";

/** Legacy route — PEP grammar uses adaptive 5-level mastery flow. */
export default function GaokaoGrammarPoint() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return <Navigate to="/gaokao/grammar" replace />;
  return <Navigate to={`/gaokao/grammar/${slug}/mastery`} replace />;
}
