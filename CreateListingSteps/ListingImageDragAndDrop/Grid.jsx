import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import PropTypes from "prop-types";
import styles from "./grid.module.css";

const ItemTypes = { CARD: "card" };
const Card = ({ key, url, index, moveCard, deleteImage, imageType }) => {
  const ref = useRef(null);
  function deleteUrl(event) {
    event.preventDefault();
    deleteImage(url);
  }
  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex, index);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    }
  });
  const [{ isDragging }, drag] = useDrag({
    item: { type: ItemTypes.CARD, key, index },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  });
  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));
  return (
    <React.Fragment>
      <div className="col-sm-12 col-lg-6 col-xl-8">
        {imageType === 1 ? (
          <div ref={ref} style={{ opacity }} className={styles.dragItem}>
            <div className="row">
              <div className={styles.mainBannerDiv}>
                <span className={styles.mainBanner}>
                  <strong>COVER PHOTO</strong>
                </span>
                <button className={styles.deleteButton} onClick={deleteUrl}>
                  <i
                    className="pe-7s-trash btn-icon-wrapper"
                    style={{ color: "white" }}
                  ></i>
                </button>
              </div>
            </div>
            <div className="row">
              <img
                src={url}
                alt="Preview Not Available"
                className={styles.mainImg}
              />
            </div>
          </div>
        ) : (
          <div ref={ref} style={{ opacity }} className={styles.dragItem}>
            <div className="row">
              <div className={styles.deleteButtonDiv}>
                <button
                  className={styles.deleteButton}
                  color="danger"
                  onClick={deleteUrl}
                >
                  <i
                    className="pe-7s-trash btn-icon-wrapper"
                    style={{ color: "white" }}
                  >
                    {" "}
                  </i>
                </button>
              </div>
            </div>
            <div className="row">
              <img
                src={url}
                alt="Preview Not Available"
                className={styles.img}
              />
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

Card.propTypes = {
  key: PropTypes.number,
  url: PropTypes.string,
  imageType: PropTypes.number,
  moveCard: PropTypes.func,
  index: PropTypes.number,
  deleteImage: PropTypes.func
};

export default Card;
