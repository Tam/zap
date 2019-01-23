import matter from 'gray-matter';

export default class Parse {

	/**
	 * Parses a content file, returning the front-matter and unparsed markdown
	 *
	 * @param fileContents - Content files contents to parse
	 */
	static content (fileContents : string) : matter.GrayMatterFile<matter.Input> {
		return matter(fileContents);
	}

}
