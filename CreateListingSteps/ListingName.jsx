import React, { Component } from "react";
import PropTypes from "prop-types";
import { Formik, FastField, Form } from "formik";
import { ListingNameSchema } from "./validationSchema.js";

class ListingName extends Component {
  submit = values => {
    this.props.handleChange(values, false);
    this.props.next();
  };
  isInitialValid = props => {
    return props.validationSchema.isValidSync(props.initialValues);
  };
  render() {
    if (this.props.values.currentStep !== 1) {
      return null;
    }
    return (
      <React.Fragment>
        <Formik
          enableReinitialize={true}
          validationSchema={ListingNameSchema}
          initialValues={this.props.values.formData}
          onSubmit={this.submit}
          isInitialValid={this.isInitialValid}
        >
          {props => {
            const { touched, errors, handleSubmit, isValid } = props;
            return (
              <Form onSubmit={handleSubmit}>
                <div className="shadow p-3 mb-5 bg-white rounded">
                  <div>
                    <label>
                      <strong>Internal Name</strong>
                    </label>
                    <FastField
                      name="internalName"
                      placeholder="Internal Name (to keep track of your personal listings)"
                      type="text"
                      className="form-control"
                      autoComplete="off"
                    />
                    {errors.internalName && touched.internalName && (
                      <span className="text-danger">{errors.internalName}</span>
                    )}
                  </div>
                  <div>
                    <label>
                      <strong>Title</strong>
                    </label>
                    <FastField
                      name="title"
                      placeholder="Title of Property"
                      type="text"
                      className="form-control"
                      autoComplete="off"
                    />
                    {errors.title && touched.title && (
                      <span className="text-danger">{errors.title}</span>
                    )}
                  </div>
                  <div>
                    <label>
                      <strong>Short Description</strong>
                    </label>
                    <FastField
                      name="shortDescription"
                      placeholder="Brief Description of Property"
                      type="text"
                      className="form-control"
                      autoComplete="off"
                    />
                    {errors.shortDescription && touched.shortDescription && (
                      <span className="text-danger">
                        {errors.shortDescription}
                      </span>
                    )}
                  </div>
                  <div>
                    <label>
                      <strong>Description</strong>
                    </label>
                    <FastField
                      name="description"
                      type="textarea"
                      className="form-control"
                      autoComplete="off"
                    />
                    {errors.description && touched.description && (
                      <span className="text-danger">{errors.description}</span>
                    )}
                  </div>
                  {/* send down list of selected amenities for upodate 
                  [{
                    "id": 4,
                    "name": "Covered Parking",
                    "iconThumb": "https://img.icons8.com/ios/50/000000/indoor-parking.png"
                  },
                  {
                    "id": 4,
                    "name": "Open Parking",
                    "iconThumb": "https://img.icons8.com/wired/64/000000/car.png"
                  }]
                  */}
                  <div className="clearfix mt-3">
                    <button
                      type="submit"
                      className="btn-shadow btn-wide float-right btn-pill btn-hover-shine btn btn-primary"
                      disabled={!isValid}
                    >
                      Next
                    </button>
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

ListingName.propTypes = {
  values: PropTypes.shape({
    formData: PropTypes.shape({
      internalName: PropTypes.string,
      title: PropTypes.string,
      shortDescription: PropTypes.string,
      description: PropTypes.string
    }),
    currentStep: PropTypes.number
  }),
  handleChange: PropTypes.func,
  next: PropTypes.func
};

export default ListingName;
