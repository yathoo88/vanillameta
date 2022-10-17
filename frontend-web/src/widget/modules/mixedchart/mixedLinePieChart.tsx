import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Stack } from '@mui/material';
import { getAggregationDataForChart, getGridSize, getLegendOption } from '@/widget/modules/utils/chartUtil';

const MixedLinePieChart = props => {
  const { option, dataSet, axis = 'x', seriesOp, defaultOp, createOp } = props;
  const reverseAxis = axis === 'x' ? 'y' : 'x';

  const [componentOption, setComponentOption] = useState({});

  const defaultComponentOption = {
    grid: { top: 50, right: 50, bottom: 50, left: 50 },
    tooltip: { trigger: 'axis' },
    [axis + 'Axis']: {
      type: 'category',
    },
    [reverseAxis + 'Axis']: {
      type: 'value',
    },
    series: [],
    emphasis: {
      focus: 'series',
      blurScope: 'coordinateSystem',
    },
    ...defaultOp,
  };

  useEffect(() => {
    if (option && dataSet) {
      const newOption = createComponentOption();
      setComponentOption(newOption);
    }
  }, [option, dataSet]);

  /**
   *
   * 위젯옵션과 데이터로
   * 컴포넌트에 맞는 형태로 생성
   */
  const createComponentOption = () => {
    console.log('createComponentOption', option);
    let newOption = {};

    const newSeries = [];
    let aggrData = [];
    option.series.forEach(item => {
      aggrData = getAggregationDataForChart(dataSet, option[axis + 'Field'], item.field, item.aggregation);
      console.log('aggrData : ', aggrData);
      if (item.field) {
        const series = {
          name: item.field,
          data: aggrData.map(dataItem => dataItem[item.field]),
          type: item.type ? item.type : 'line',
          color: item.color,
          smooth: true,
          ...seriesOp,
        };
        newSeries.push(series);
      }
    });
    if (option.pie.field) {
      const pieAggrData = getAggregationDataForChart(dataSet, option.pie.name, option.pie.field, option.pie.aggregation);

      const series = {
        name: option.pie.name,
        data: pieAggrData.map(item => ({
          value: item[option.pie.field],
          name: item[option.pie.name],
        })),
        type: 'pie',
        color: [...option.pie.color],
        center: option.pie.center,
        radius: option.pie.radius,
        label: {
          show: !!option.pie.name && true,
          // position: 'center',
          formatter: '{b}: {d}%',
        },
        tooltip: {
          trigger: 'item',
        },
        z: 100,
      };
      newSeries.unshift(series);
    }

    // if (aggrData && option[axis + 'Field']) {
    const op = {
      [axis + 'Axis']: {
        type: 'category',
        data: option[axis + 'Field'] ? aggrData.map(item => item[option[axis + 'Field']]) : '',
      },
      series: newSeries,
      grid: getGridSize(option.legendPosition),
      legend: getLegendOption(option.legendPosition),
      ...createOp,
    };

    newOption = { ...defaultComponentOption, ...op };
    // }

    // console.log(newOption);
    return newOption;
  };

  return (
    <Stack
      sx={{
        width: '100%',
        height: '100%',
      }}
    >
      <ReactECharts option={componentOption} style={{ height: '100%', width: '100%' }} lazyUpdate={true} notMerge={true} />
    </Stack>
  );
};

export default MixedLinePieChart;
