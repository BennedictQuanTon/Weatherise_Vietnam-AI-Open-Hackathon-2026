// Shared ffmpeg settings so every rendered video plays on iPhone / iPad as well as desktop.
//
// Frames come from Chrome JPEG screenshots, which carry three things iOS's video pipeline does not expect:
//   1. full-range "yuvj420p" pixels, 2. a BT.601 matrix, and 3. an embedded sRGB ICC profile that ffmpeg
//   copies into the MP4 as a `colr` box of type `prof`. Standard web video is limited-range yuv420p, BT.709,
//   tagged with a plain `colr nclx` box. These filters/tags convert to that (a real conversion, not a relabel).

/** From screenshot frames (full range, BT.601, ICC) to standard web video. */
export const FROM_FRAMES = "sidedata=mode=delete:type=ICC_PROFILE,scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p";

/** Downscaled cut of a master that is already standard (drops any ICC profile again, just in case). */
export const cut = (width, extra = "") => `sidedata=mode=delete:type=ICC_PROFILE,scale=${width}:-2${extra},format=yuv420p`;

/** Color tags + fast start. VideoToolbox ignores the tag flags, so h264_metadata writes BT.709 into the stream itself;
 *  write_colr then makes ffmpeg emit the matching `colr nclx` box (primaries / transfer / matrix = 1 / 1 / 1). */
export const WEB_TAGS = [
  "-bsf:v", "h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0",
  "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-movflags", "+faststart+write_colr",
];
