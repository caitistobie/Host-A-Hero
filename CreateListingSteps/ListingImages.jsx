import React, { Component } from "react";
import logger from "sabio-debug";
import PropTypes from "prop-types";
import { Formik, Form } from "formik";
import { ListingLocationSchema } from "./validationSchema.js";
import FileUpload from "../files/FileUpload";
import * as ListingService from "../../services/listingService";
import Swal from "sweetalert2";
import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import Grid from "./Grid.jsx";

const _logger = logger.extend("ListingImages");

class ListingImages extends Component {
  state = {
    showMore: true,
    transform: true,
    showInkBar: true,
    dropdownOpen: false,

    transformWidth: 400,
    files: [],
    images: [],
    fileForUpload: []
  };

  submit = () => {
    let values = this.state.images;
    this.props.handleImages(values, false);
    this.props.next();
  };
  isInitialValid = props => {
    return props.validationSchema.isValidSync(props.initialValues);
  };

  componentDidUpdate(prevProps) {
    if (
      prevProps.values.formData.images !== this.props.values.formData.images
    ) {
      let existingImages = this.props.values.formData.images;
      this.setState(() => {
        return { images: existingImages };
      });
    }
  }

  fetchFiles = response => {
    this.setState(() => {
      return { files: response };
    });
    this.getImages();
  };

  getImages = () => {
    let imageArray = this.state.files[0].map(this.mapFileUrls);
    this.setState(prevState => {
      let images = [...prevState.images, ...imageArray];
      return { images };
    });
  };

  mapFileUrls = (fileUrl, index) => {
    let imageType = 2;
    if (index === 0) {
      imageType = 1;
    }
    return { fileUrl, imageType };
  };

  refreshFilesAfterDelete = url => {
    let index;
    for (let x = 0; x < this.state.images.length; x++) {
      if (this.state.images[x].fileUrl === url) {
        index = x;
        break;
      }
    }

    if (index !== undefined) {
      let result = [...this.state.images];

      result.splice(index, 1);

      this.setState(() => {
        return { images: result };
      });
    }
  };

  sendDelete = url => {
    ListingService.deleteUploadedImage(url)
      .then(this.refreshFilesAfterDelete(url))
      .catch(this.handleFetchFilesFail);
  };

  handleGetFilesDelete = () => {
    Swal.fire(
      "Oops!",
      "Sorry we couldn't delete your file right now",
      "warning"
    );
  };

  moveCard = (dragIndex, hoverIndex) => {
    _logger(
      "move card is firing and then giving me a cannot read property of fileUrl of undefined in my <card>",
      dragIndex,
      hoverIndex
    );
    this.setState(() => {
      const dragCard = this.state.images[dragIndex];
      let result = [...this.state.images];
      result.splice(dragIndex, 1);
      result.splice(hoverIndex, 0, dragCard);
      for (let index = 0; index < result.length; index++) {
        const element = result[index];
        element.imageType = index === 0 ? 1 : 2;
        result[index] = { ...element };
      }
      return { images: result };
    });
  };

  mapImages = (image, index) => {
    _logger("give me the money", image, index);
    return (
      <Grid
        key={index + 1}
        url={image.fileUrl}
        imageType={image.imageType}
        moveCard={this.moveCard}
        index={index}
        deleteImage={this.sendDelete}
      />
    );
  };

  render() {
    if (this.props.values.currentStep !== 6) {
      return null;
    }
    return (
      <React.Fragment>
        <Formik
          enableReinitialize={true}
          validationSchema={ListingLocationSchema}
          initialValues={this.props.values.formData}
          onSubmit={this.submit}
          isInitialValid={this.isInitialValid}
        >
          {props => {
            const { handleSubmit } = props;
            return (
              <Form onSubmit={handleSubmit}>
                <div className="shadow p-3 mb-5 bg-white rounded">
                  <div className="col-sm-12 col-lg-12 col-xl-12">
                    <h2>
                      Please upload images to be associated with your listing.
                    </h2>
                    <h5>We suggest uploading at least 3 photos.</h5>
                    <FileUpload AfterUpload={this.fetchFiles} />
                    <DndProvider key={1} backend={HTML5Backend}>
                      {this.state.images.length > 0
                        ? this.state.images.map(this.mapImages)
                        : null}
                    </DndProvider>
                    <div className="clearfix mt-3">
                      <button
                        type="button"
                        className="btn-shadow btn-wide float-left btn-pill btn-hover-shine btn btn-secondary"
                        onClick={this.props.prev}
                      >
                        Previous
                      </button>
                      <button
                        type="submit"
                        className="btn-shadow btn-wide float-right btn-pill btn-hover-shine btn btn-primary"
                        onClick={this.submit}
                        disabled={this.state.images.length === 0}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </Form>
            );
          }}
        </Formik>
      </React.Fragment>
    );
  }
}

ListingImages.propTypes = {
  values: PropTypes.shape({
    formData: PropTypes.shape({
      locationId: PropTypes.number,
      id: PropTypes.number,
      images: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number,
          imageType: PropTypes.number,
          listingId: PropTypes.number,
          url: PropTypes.string
        })
      )
    }),
    currentStep: PropTypes.number
  }),
  handleChange: PropTypes.func,
  handleImages: PropTypes.func,
  prev: PropTypes.func,
  next: PropTypes.func
};

export default ListingImages;
