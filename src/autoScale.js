import * as d3 from "d3";

const DEFAULT_OPTIONS = {
    marginRatio: 0.1,
    extendThreshold: 0.05,
    contractThreshold: 0.05
};

export function adjustScale(scale, data, getter, options) {
    options = fixOptions(options);
    const [min, max] = d3.extent(data, getter);
    const [oldMin, oldMax] = getCurrentExtent(scale, options);
    const [newMin, newMax] = getExtent(oldMin, oldMax, min, max, options);
    if (newMin !== oldMin || newMax !== oldMax) {
        const margin = max === min ? (max * options.marginRatio) : (max - min) * options.marginRatio;
        scale.domain([min - margin, max + margin]);
        return true;
    } else {
        return false;
    }
}

function fixOptions(options = {}) {
    const getOrDefault = (value, defaultValue) => value === undefined ? defaultValue : value;
    return {
        marginRatio: getOrDefault(options.marginRatio, DEFAULT_OPTIONS.marginRatio),
        extendThreshold: getOrDefault(options.extendThreshold, DEFAULT_OPTIONS.extendThreshold),
        contractThreshold: getOrDefault(options.contractThreshold, DEFAULT_OPTIONS.contractThreshold),
    };
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
    const oldRange = oldMax - oldMin;
    if (newMin === undefined || newMax === undefined) {
        return [oldMin, oldMax];
    } else if (oldRange === 0) {
        return [newMin, newMax];
    }

    const extent = [oldMin, oldMax];
    if (newMin < oldMin) {
        const ratio = (oldMin - newMin) / oldRange;
        // console.log(`Min bound extended: ${oldMin} -> ${newMin}, ratio=${ratio}`);
        if (ratio > options.extendThreshold) {
            // console.log("Keeping new (lower) min");
            extent[0] = newMin;
        }
    } else if (newMin > oldMin) {
        const ratio = (newMin - oldMin) / oldRange;
        // console.log(`Min bound contracted: ${oldMin} -> ${newMin}, ratio=${ratio}`);
        if (ratio > options.contractThreshold) {
            // console.log("Keeping new (higher) min");
            extent[0] = newMin;
        }
    }

    if (newMax > oldMax) {
        const ratio = (newMax - oldMax) / oldRange;
        // console.log(`Max bound extended: ${oldMax} -> ${newMax}, ratio=${ratio}`);
        if (ratio > options.extendThreshold) {
            // console.log("Keeping new (higher) max");
            extent[1] = newMax;
        }
    } else if (newMax < oldMax) {
        const ratio = (oldMax - newMax) / oldRange;
        // console.log(`Min bound contracted: ${oldMin} -> ${newMin}, ratio=${ratio}`);
        if (ratio > options.contractThreshold) {
            // console.log("Keeping new (lower) max");
            extent[1] = newMax;
        }
    }
    return extent;
}
