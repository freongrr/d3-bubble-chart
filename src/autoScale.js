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
        // TODO : smooth transition
        scale.domain([min - margin, max + margin]);
        return true;
    } else {
        return false;
    }
}

function fixOptions(options = {}) {
    return {
        marginRatio: options.marginRatio || DEFAULT_OPTIONS.marginRatio,
        extendThreshold: options.extendThreshold || DEFAULT_OPTIONS.extendThreshold,
        contractThreshold: options.contractThreshold || DEFAULT_OPTIONS.contractThreshold,
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
    if (newMin === undefined || newMax === undefined) {
        return [oldMin, oldMax];
    }

    const oldRange = oldMax - oldMin;
    const newRange = newMax - newMin;
    if (oldRange === 0) {
        return [newMin, newMax];
    }

    const extent = [oldMin, oldMax];
    const ratio = Math.abs(newRange - oldRange) / oldRange;
    if (newMin !== oldMin) {
        if (newMin < oldMin && ratio > options.extendThreshold) {
            extent[0] = newMin;
        } else if (newMin > oldMin && ratio > options.contractThreshold) {
            extent[0] = newMin;
        }
    }
    if (newMax !== oldMax) {
        if (newMax > oldMax && ratio > options.extendThreshold) {
            extent[1] = newMax;
        } else if (newMax < oldMax && ratio > options.contractThreshold) {
            extent[1] = newMax;
        }
    }
    return extent;
}
