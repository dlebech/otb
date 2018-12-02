import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const GroupedTransaction = props => {
  if (!props.transactionGroup) return null;

  const deleteGroup = e => {
    e.stopPropagation();
    props.handleDeleteTransactionGroup(props.transactionGroup.groupId);
    return false;
  };

  const id = `link-tip-${props.transactionId}`;
  return (
    <>
      <FontAwesomeIcon
        icon="link"
        className="cursor-pointer text-info"
        data-tip=""
        data-for={id}
        fixedWidth
        onClick={deleteGroup}
      />
      <ReactTooltip id={id}>
        <div>This transaction is grouped with:</div>
        {props.transactionGroup.linkedTransactions.map(t => {
          return (
            <div key={`${id}-${t.id}`}>
              {t.date.format('L')}: {t.description.substr(0, 30)}{t.description.length > 30 ? '...': ''}
            </div>
          );
        })}
        <div className="mt-2">Click to ungroup</div>
      </ReactTooltip>
    </>
  );
};

GroupedTransaction.propTypes = {
  transactionId: PropTypes.string.isRequired,
  transactionGroup: PropTypes.shape({
    groupId: PropTypes.string.isRequired,
    linkedTransactions: PropTypes.arrayOf(PropTypes.shape({
      description: PropTypes.string.isRequired
    })).isRequired
  }),
  handleDeleteTransactionGroup: PropTypes.func.isRequired
};

export default GroupedTransaction;
