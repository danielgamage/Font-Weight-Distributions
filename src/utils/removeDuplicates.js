const removeDuplicates = (array, prop) => {
    return array.filter((el, i, arr) => {
        return arr.map(mapObj => mapObj[prop]).indexOf(el[prop]) === i;
    });
}

export default removeDuplicates
