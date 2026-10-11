function StatCard({
  title,
  value,
  description,
  icon: Icon,
  variant = "blue",
}) {
  return (
    <div className="stat-card">

      <div className={`stat-icon ${variant}`}>
        {Icon && <Icon size={22} />}
      </div>

      <div className="stat-card-info">

        <span>{title}</span>

        <h3>{value}</h3>

        {description && (
          <small>{description}</small>
        )}

      </div>

    </div>
  );
}

export default StatCard;