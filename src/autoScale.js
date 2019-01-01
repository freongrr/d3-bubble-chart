import * as d3 from "d3";

const DEFAULT_OPTIONS = {
    marginRatio: 0.1,
    extendThreshold: 0.05,
    contractThreshold: 0.05
};

export function adjustScale(scale, data, getter, options = DEFAULT_OPTIONS) {
    const [min, max] = d3.extent(data, getter);
    const [oldMin, oldMax] = getCurrentExtent(scale, options);
    const [newMin, newMax] = getExtent(oldMin, oldMax, min, max, options);
    if (newMin !== oldMin || newMax !== oldMax) {
        const margin = max === min ? (max * options.marginRatio) : (max - min) * options.marginRatio;
        scale.domain([min - margin, max + margin]);
    }
}

export function getCurrentExtent(scale, options) {
    const domain = scale.domain();
    const domainRange = domain[1] - domain[0];
    const oldMargin = (domainRange - (domainRange / (1 + 2 * options.marginRatio))) / 2;
    const oldMin = domain[0] + oldMargin;
    const oldMax = domain[1] - oldMargin;
    return [oldMin, oldMax];
}

export function getExtent(oldMin, oldMax, newMin, newMax, options) {
    if (newMin === undefined || newMax === undefined) {
        return [oldMin, oldMax];
    }

    const oldRange = oldMax - oldMin;
    const newRange = newMax - newMin;
    if (oldRange === 0) {
        return [newMin, newMax];
    }

    const ratio = Math.abs(newRange - oldRange) / oldRange;
    console.log(`Range: ${oldRange} -> ${newRange}, ratio=${ratio}`);

    const extent = [oldMin, oldMax];
    if (newMin !== oldMin) {
        // console.log(`Min has changed: ${oldMin} -> ${newMin}`);
        if (newMin < oldMin && ratio > options.extendThreshold) {
            console.log(`Min has extended outside of threshold: ${oldMin} -> ${newMin} (ratio: ${ratio} > ${options.extendThreshold})`);
            extent[0] = newMin;
        } else if (newMin > oldMin && ratio > options.contractThreshold) {
            console.log(`Min has contracted outside of threshold: ${oldMin} -> ${newMin} (ratio: ${ratio} > ${options.contractThreshold})`);
            extent[0] = newMin;
        }
    }
    if (newMax !== oldMax) {
        const ratio = Math.abs(newRange - oldRange) / oldRange;
        // console.log(`Max has changed: ${oldMax} -> ${newMax}`);
        if (newMax > oldMax && ratio > options.extendThreshold) {
            console.log(`Max has extended outside of threshold: ${oldMax} -> ${newMax} (ratio: ${ratio} > ${options.extendThreshold})`);
            extent[1] = newMax;
        } else if (newMax < oldMax && ratio > options.contractThreshold) {
            console.log(`Max has contracted outside of threshold: ${oldMax} -> ${newMax} (ratio: ${ratio} > ${options.contractThreshold})`);
            extent[1] = newMax;
        }
    }
    return extent;
}
