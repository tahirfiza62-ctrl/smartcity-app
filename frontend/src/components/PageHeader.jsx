function PageHeader({
  title,
  description,
  buttonText,
  onButtonClick,
}) {
  return (
    <div className="page-intro">

      <div>
        <h1>{title}</h1>

        <p>{description}</p>
      </div>

      {buttonText && (
        <button
          className="primary-btn"
          onClick={onButtonClick}
        >
          {buttonText}
        </button>
      )}

    </div>
  );
}

export default PageHeader;