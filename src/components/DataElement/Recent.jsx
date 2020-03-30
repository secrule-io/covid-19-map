import React, { useState } from 'react';
import {useStyletron} from 'baseui';
import {Search} from 'baseui/icon';
import {Input, SIZE} from 'baseui/input';
import {
  StyledBody as StyledTableBody,
  StyledCell,
  StyledHead,
  StyledHeadCell,
  StyledRow,
  StyledTable
} from 'baseui/table';
import {Label3, Paragraph3, Paragraph4} from 'baseui/typography';
import {StyledLink} from 'baseui/link';
import {ProgressBar} from 'baseui/progress-bar';
import { useData } from '../../contexts/DataContext';

function SearchIcon() {
  const [css, theme] = useStyletron();
  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.sizing.scale500,
      })}
    >
      <Search size="18px" />
    </div>
  );
}

const compare = (originalText = '', filterValue = '') =>
  originalText.toLowerCase().includes(filterValue.toLowerCase().trim());

export default function Recent({ isLoading, data }) {
  const [, theme] = useStyletron();
  const [filter, setFilter] = useState('');
  const filteredData =
    data?.filter(
      ({ city, date }) => compare(city, filter) || compare(date, filter)
    ) || [];
  const { setClickedCity } = useData();

  return (
    <>
      <Label3 $style={{ marginBottom: '12px' }}>
        Recent
      </Label3>
      <Input
        size={SIZE.compact}s
        overrides={{Before: SearchIcon}}
        placeholder="Search"
        onChange={event => setFilter(event.target.value)}
        value={filter}
      />
      <StyledTable
        $style={{
          borderColor: theme.colors.backgroundTertiary,
          marginTop: '12px',
          minHeight: '100px'
        }}
      >
        {isLoading && <ProgressBar
          infinite
          overrides={{
            Bar: {
              style: {
                marginBottom: 0,
                marginLeft: 0,
                marginRight: 0,
                marginTop: 0,
              },
            },
          }}/>}

        <StyledHead role="row">
          <StyledHeadCell role="columnheader">
            <Paragraph3 margin={0}>Date</Paragraph3>
          </StyledHeadCell>
          <StyledHeadCell role="columnheader">
            <Paragraph3 margin={0}>Count</Paragraph3>
          </StyledHeadCell>
          <StyledHeadCell role="columnheader">
            <Paragraph3 margin={0}>State</Paragraph3>
          </StyledHeadCell>
        </StyledHead>
        <StyledTableBody>
          {filteredData.slice().reverse().map(({date, count, city, source}, index) => (
            <StyledRow key={index}>
              <StyledCell>
                <Paragraph4
                  margin={0}
                >
                  <StyledLink href={source} target="_blank">{date}</StyledLink>
                </Paragraph4>
              </StyledCell>
              <StyledCell>
                <Paragraph4
                  margin={0}
                >
                  {count}
                </Paragraph4>
              </StyledCell>
              <StyledCell>
                <Paragraph4
                  margin={0}
                >
                  {city ? <StyledLink onClick={() => setClickedCity(city)} $style={{ cursor: 'pointer' }}>{city}</StyledLink> : 'Not Found' }
                </Paragraph4>
              </StyledCell>
            </StyledRow>
          ))}
        </StyledTableBody>
      </StyledTable>
    </>
  );
}