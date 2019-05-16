using System;
using System.Collections.Generic;
using System.Text;

namespace Distinct
{
	public class Solution
	{
		public Solution()
		{
		}
		//https://app.codility.com/demo/results/training8AKY8D-W3X/

		public int solution(int[] A)
		{
			if (A.Length < 1 || A.Length > 100000)
				return 0;

			int[] ns = new int[2000001];

			int indice;
			int unicos = 0;

			for (int i = 0; i < A.Length; i++)
			{
				if (A[i] < -1000000 || A[i] > 1000000)
					return 0;

				indice = 1000000 + A[i];
				ns[indice]++;

				if (ns[indice] == 1)
					unicos++;
			}

			return unicos;
		}
	}
}
