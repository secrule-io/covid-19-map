import React from 'react';
import { Display2, Display4, Paragraph2, Paragraph3 } from 'baseui/typography';
import { StyledBody } from 'baseui/card';
import ArrowUp from 'baseui/icon/arrow-up';
import { StatefulTooltip, PLACEMENT } from 'baseui/tooltip';
import { Block } from 'baseui/block';
import { useStyletron } from 'baseui';

import { StyledCard } from '..';
import ContentLoader from 'react-content-loader';

import { useData } from '../../contexts/DataContext';
import moment from 'moment';
import { sum } from '../../helpers/misc';
import useWindowDimensions from '../../hooks/window-dimensions';

function CountLoader() {
  const [, theme] = useStyletron();

  return (
    <ContentLoader
      speed={0.6}
      width={50}
      height={64}
      display={'block'}
      viewBox="0 0 50 64"
      backgroundColor={theme.colors.backgroundTertiary}
      foregroundColor={theme.colors.backgroundSecondary}
    >
      <rect x="0" y="5" rx="2" ry="2" width="40" height="54" />
    </ContentLoader>
  );
}

export function Figure({ data, isLoading, label, color, size = 'standard' }) {
  const total = (data && sum(data)) || 0;
  const todayGrowth = (data && sum(data.filter(({ date }) => date === moment().format('YYYY-MM-DD')))) || 0;

  return (
    <div>
      {isLoading &&
        <CountLoader />
      }
      {!isLoading &&
        <Block display="flex">
          {size === 'standard'
            ? <Display2 color={color}>{total.toLocaleString()}</Display2>
            : <Display4 color={color}>{total.toLocaleString()}</Display4>
          }
          {todayGrowth > 0 &&
            <StatefulTooltip
              content={() => (
                <Paragraph3 color="backgroundPrimary">Today's Change</Paragraph3>
              )}
              overrides={{
                Body: {
                  style: {
                    backgroundColor: 'transparent'
                  }
                },
                Inner: {
                  style: ({ $theme }) => ({
                    borderRadius: $theme.borders.radius200,
                    boxShadow: $theme.lighting.shadow500
                  })
                }
              }}
              placement={PLACEMENT.top}
              returnFocus
              autoFocus
              showArrow
            >
              <span style={{
                display: 'flex',
                fontWeight: 400,
                fontSize: size === 'standard' ? '24px' : '16px',
                color: '#7b7b7b',
                lineHeight: size === 'standard' ? '32px' : '24px'
              }}><ArrowUp size={size === 'standard' ? 32 : 24} />{todayGrowth}</span>
            </StatefulTooltip>
          }
        </Block>
      }
      {size === 'standard'
        ? <Paragraph2 marginTop={0}>{label}</Paragraph2>
        : <Paragraph3 marginTop={0}>{label}</Paragraph3>
      }
    </div>
  );
}


export default function Figures() {
  const { cases, deaths, cures, isLoading } = useData();
  // const [showMore, setShowMore] = useState(false);
  const [, theme] = useStyletron();
  const { width } = useWindowDimensions()

    return (
    <StyledCard
      title="Coronovirus in Sudan"
      style={$theme => ({
        [$theme.mediaQuery.medium]: {
          maxHeight: 'calc(100vh - 80px)',
          overflow: 'auto'
        },
        [$theme.mediaQuery.large]: {
          width: '380px'
        }
      })}
    >
      <StyledBody>
        <Figure
          data={deaths}
          isLoading={isLoading}
          label="Death"
          color={theme.colors.primary}
          size={width < theme.breakpoints.medium ? 'compact' : 'standard'}
        />
        <Figure
          data={cases}
          isLoading={isLoading}
          label="Confirmed Cases"
          color={theme.colors.negative}
          size={width < theme.breakpoints.medium ? 'compact' : 'standard'}
        />
        <Figure
          data={cures}
          isLoading={isLoading}
          label="Cured"
          color={theme.colors.positive}
          size={width < theme.breakpoints.medium ? 'compact' : 'standard'}
        />
      </StyledBody>
    </StyledCard>
  );
}

