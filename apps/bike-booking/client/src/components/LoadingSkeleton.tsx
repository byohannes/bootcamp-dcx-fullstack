import "./LoadingSkeleton.css";

interface LoadingSkeletonProps {
  count?: number;
  type?: "card" | "text" | "avatar";
}

export function LoadingSkeleton({
  count = 1,
  type = "card",
}: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`skeleton skeleton-${type}`}>
          {type === "card" && (
            <>
              <div className="skeleton-image" />
              <div className="skeleton-content">
                <div className="skeleton-title" />
                <div className="skeleton-text" />
                <div className="skeleton-text short" />
              </div>
            </>
          )}
          {type === "text" && <div className="skeleton-line" />}
          {type === "avatar" && <div className="skeleton-circle" />}
        </div>
      ))}
    </>
  );
}
