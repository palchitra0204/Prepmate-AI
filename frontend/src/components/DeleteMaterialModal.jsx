import {
  AlertTriangle,
  Trash2,
  X,
} from "lucide-react";


const DeleteMaterialModal = ({
  isOpen,
  material,
  isDeleting = false,
  onClose,
  onConfirm,
}) => {
  if (
    !isOpen ||
    !material
  ) {
    return null;
  }


  const handleOverlayClick = (
    event
  ) => {
    if (
      event.target ===
      event.currentTarget &&
      !isDeleting
    ) {
      onClose();
    }
  };


  const handleConfirm = () => {
    if (
      isDeleting
    ) {
      return;
    }


    onConfirm(
      material
    );
  };


  return (
    <div
      className="delete-modal-overlay"

      onMouseDown={
        handleOverlayClick
      }
    >

      <div
        className="delete-modal"

        role="dialog"

        aria-modal="true"

        aria-labelledby="delete-modal-title"
      >

        <button
          type="button"

          className="delete-modal-close"

          onClick={
            onClose
          }

          disabled={
            isDeleting
          }

          aria-label="Close delete modal"
        >

          <X size={20} />

        </button>


        <div className="delete-modal-icon">

          <AlertTriangle
            size={28}
          />

        </div>


        <div className="delete-modal-content">

          <h2 id="delete-modal-title">
            Delete material?
          </h2>


          <p>
            Are you sure you want
            to delete{" "}

            <strong>
              {material.title ||
                material.originalFileName ||
                "this material"
              }
            </strong>

            ?
          </p>


          <p className="delete-modal-warning">
            Generated MCQs,
            question-answers and
            interview preparation
            linked with this material
            will also be deleted.
          </p>

        </div>


        <div className="delete-modal-actions">

          <button
            type="button"

            className="delete-cancel-button"

            onClick={
              onClose
            }

            disabled={
              isDeleting
            }
          >
            Cancel
          </button>


          <button
            type="button"

            className="delete-confirm-button"

            onClick={
              handleConfirm
            }

            disabled={
              isDeleting
            }
          >

            <Trash2
              size={18}
            />


            <span>

              {isDeleting
                ? "Deleting..."
                : "Delete material"
              }

            </span>

          </button>

        </div>

      </div>

    </div>
  );
};


export default DeleteMaterialModal;