import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useHistory } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { upperFirst } from 'lodash';
import useListView from '../../hooks/useListView';
import TableHeader from './TableHeader';
import { Table, TableEmpty, TableRow, RootRow, ToogleRootRow } from './styledComponents';
import ActionCollapse from './ActionCollapse';
import Row from './Row';


const CustomTable = ({ data, headers, isBulkable, rowsToHighlight, relationColumnName }) => {
  const {
    emitEvent,
    entriesToDelete,
    label,
    searchParams: { filters, _q },
  } = useListView();
  const { pathname, search } = useLocation();
  const { push } = useHistory();
  const redirectUrl = `redirectUrl=${pathname}${search}`;
  const colSpanLength = isBulkable ? headers.length + 2 : headers.length + 1;
  const [collapsedIds, setCollapsedIds] = useState([]);

  const handleGoTo = id => {
    emitEvent('willEditEntryFromList');
    push({
      pathname: `${pathname}/${id}`,
      search: redirectUrl,
    });
  };

  const values = { contentType: upperFirst(label), search: _q };
  let tableEmptyMsgId = filters.length > 0 ? 'withFilters' : 'withoutFilter';

  if (_q !== '') {
    tableEmptyMsgId = 'withSearch';
  }

  const isCollapsed = (id) => collapsedIds.find(el => el === id);

  const manageCollapsedIds = (id) => {
    if(isCollapsed(id)) {
      setCollapsedIds(collapsedIds.filter(el => el !== id))
    } else {
      setCollapsedIds([...collapsedIds, id])
    }
  }

  const renderRootRow = (row, level) => (
    <>
      <RootRow
        key={row.id}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          handleGoTo(row.id);
        }}
      >
        <Row 
          relationColumnName={relationColumnName}
          isWrappedWithRoot={true}
          manageCollapsedIds={manageCollapsedIds}
          isCollapsed={isCollapsed(row.id)}
          isBulkable={isBulkable} 
          headers={headers} 
          row={row} 
          goTo={handleGoTo} 
          level={level+1}
        />
      </RootRow>
      <ToogleRootRow className={isCollapsed(row.id) ? "collapse show" : "collapse" }>
        {row.child && renderRowChild(row.child, level+1)}
      </ToogleRootRow>
    </>
  )

  const renderRowChild = (row, level) => (
    <>
        <TableRow
          key={row.id}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            handleGoTo(row.id);
          }}
        >
          <Row 
            relationColumnName={relationColumnName}
            isBulkable={isBulkable} 
            headers={headers} 
            row={row} 
            goTo={handleGoTo} 
            level={level+1}
          />
        </TableRow>
        {row.child && renderRowChild(row.child, level+1)}
    </>
    );

  const content =
    data.length === 0 ? (
      <TableEmpty>
        <td colSpan={colSpanLength}>
          <FormattedMessage
            id={`content-manager.components.TableEmpty.${tableEmptyMsgId}`}
            values={values}
          />
        </td>
      </TableEmpty>
    ) : (
      data.map(row => {
        if(row.child) {
          let level = -1;
          return renderRootRow(row, level);
        }
        return (
          <TableRow
            hightlighted={rowsToHighlight.includes(row.id)}
            key={row.id}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              handleGoTo(row.id);
            }}
          >
            <Row isBulkable={isBulkable} headers={headers} row={row} goTo={handleGoTo} />
          </TableRow>
        );
      })
    );

  return (
    <Table className="table">
      <TableHeader headers={headers} isBulkable={isBulkable} />
      <tbody>
        {entriesToDelete.length > 0 && <ActionCollapse colSpan={colSpanLength} />}
        {content}
      </tbody>
    </Table>
  );
};

CustomTable.defaultProps = {
  data: [],
  headers: [],
  isBulkable: true,
};

CustomTable.propTypes = {
  data: PropTypes.array,
  headers: PropTypes.array,
  isBulkable: PropTypes.bool,
};

export default memo(CustomTable);

