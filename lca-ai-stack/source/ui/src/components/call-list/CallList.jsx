// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useEffect, useState } from 'react';
import { Table, Pagination, TextFilter } from '@awsui/components-react';
import { useCollection } from '@awsui/collection-hooks';
import { Logger } from 'aws-amplify';

import useCallsContext from '../../contexts/calls';

import mapCallsAttributes from '../common/map-call-attributes';
import { paginationLabels } from '../common/labels';

import {
  CallsPreferences,
  CallsCommonHeader,
  COLUMN_DEFINITIONS_MAIN,
  KEY_COLUMN_ID,
  SELECTION_LABELS,
  DEFAULT_PREFERENCES,
  DEFAULT_SORT_COLUMN,
} from './calls-table-config';

import { getFilterCounterText, TableEmptyState, TableNoMatchState } from '../common/table';

import '@awsui/global-styles/index.css';

const logger = new Logger('CallList');

const CallList = () => {
  const [callList, setCallList] = useState([]);

  const {
    calls,
    isCallsListLoading,
    setIsCallsListLoading,
    setPeriodsToLoad,
    setSelectedItems,
    setToolsOpen,
    periodsToLoad,
  } = useCallsContext();

  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

  // prettier-ignore
  const {
    items, actions, filteredItemsCount, collectionProps, filterProps, paginationProps,
  } = useCollection(callList, {
    filtering: {
      empty: <TableEmptyState resourceName="Call" />,
      noMatch: <TableNoMatchState onClearFilter={() => actions.setFiltering('')} />,
    },
    pagination: { pageSize: preferences.pageSize },
    sorting: { defaultState: { sortingColumn: DEFAULT_SORT_COLUMN, isDescending: true } },
    selection: {
      keepSelection: false,
      trackBy: KEY_COLUMN_ID,
    },
  });

  useEffect(() => {
    if (!isCallsListLoading) {
      logger.debug('setting call list', calls);
      setCallList(mapCallsAttributes(calls));
    } else {
      logger.debug('call list is loading');
    }
  }, [isCallsListLoading, calls]);

  useEffect(() => {
    logger.debug('setting selected items', collectionProps.selectedItems);
    setSelectedItems(collectionProps.selectedItems);
  }, [collectionProps.selectedItems]);

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <Table
      {...collectionProps}
      header={
        <CallsCommonHeader
          resourceName="Calls"
          selectedItems={collectionProps.selectedItems}
          totalItems={callList}
          updateTools={() => setToolsOpen(true)}
          loading={isCallsListLoading}
          setIsLoading={setIsCallsListLoading}
          periodsToLoad={periodsToLoad}
          setPeriodsToLoad={setPeriodsToLoad}
        />
      }
      columnDefinitions={COLUMN_DEFINITIONS_MAIN}
      items={items}
      loading={isCallsListLoading}
      loadingText="Loading calls"
      selectionType="multi"
      ariaLabels={SELECTION_LABELS}
      filter={
        <TextFilter
          {...filterProps}
          filteringAriaLabel="Filter calls"
          filteringPlaceholder="Find calls"
          countText={getFilterCounterText(filteredItemsCount)}
        />
      }
      wrapLines={preferences.wrapLines}
      pagination={<Pagination {...paginationProps} ariaLabels={paginationLabels} />}
      preferences={<CallsPreferences preferences={preferences} setPreferences={setPreferences} />}
      trackBy={items.callId}
      visibleColumns={[KEY_COLUMN_ID, ...preferences.visibleContent]}
      resizableColumns
    />
  );
};

export default CallList;
