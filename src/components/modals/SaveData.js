import React from 'react';
import { connectModal } from 'redux-modal';

const SAVE_DATA_MODAL = 'save-data';

const SaveData = connectModal({ name: SAVE_DATA_MODAL })(props => {
  if (!props.show) return null;

  return (
    <div className="modal" style={{display: 'block'}}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h6 className="modal-title">
              Saving data in the browser?
            </h6>
          </div>
          <div className="modal-body">
            <p>
              If enabled, the data will be saved in the browser&#39;s local storage.
              The data will be available if you close and re-open the
              browser, but it will <em>not</em> be accessible by other
              websites.
            </p>
            <p>
              On a shared machine, this feature is not recommended. Download
              the data instead, and restore it later with the restore function.
            </p>
          </div>
          <div className="modal-footer">
            <div className="container-fluid">
              <div className="row justify-content-center">
                <div className="col-auto">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={props.handleHide}
                >
                  Cool
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

SaveData.modalName = SAVE_DATA_MODAL;

export default SaveData;