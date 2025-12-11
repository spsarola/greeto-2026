// app/utils/bigint-serializer.js
// Patch BigInt so it can be safely serialized in JSON responses

if (!BigInt.prototype.toJSON) {
  // eslint-disable-next-line no-extend-native
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };
}
