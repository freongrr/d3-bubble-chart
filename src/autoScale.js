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
        if (newMin === 0 && newMax === 0) {
            scale.domain([-1, 1]);
        } else if (max === min) {
            const margin = max * options.marginRatio;
            scale.domain([min - margin, max + margin]);
        } else {
            const margin = (max - min) * options.marginRatio;
            scale.domain([min - margin, max + margin]);
        }
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
        if (ratio > options.extendThreshold) {
            extent[0] = newMin;
        }
    } else if (newMin > oldMin) {
        const ratio = (newMin - oldMin) / oldRange;
        if (ratio > options.contractThreshold) {
            extent[0] = newMin;
        }
    }

    if (newMax > oldMax) {
        const ratio = (newMax - oldMax) / oldRange;
        if (ratio > options.extendThreshold) {
            extent[1] = newMax;
        }
    } else if (newMax < oldMax) {
        const ratio = (oldMax - newMax) / oldRange;
        if (ratio > options.contractThreshold) {
            extent[1] = newMax;
        }
    }
    return extent;
}
