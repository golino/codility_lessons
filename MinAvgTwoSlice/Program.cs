using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MinAvgTwoSlice
{
	public class Program
	{
		static void Main(string[] args)
		{
			//Console.WriteLine("A menor média é: {0}", solution(new int[] { 4, 2, 2, 5, 1, 5, 8 }));
			Console.WriteLine("A menor média é: {0}", solution(new int[] { 10, 10, -1, 2, 4, -1, 2, -1 }));
			Console.ReadLine();
		}
		public static int solution(int[] A)
		{
			int indice = 0;

			if (A.Length < 2 || A.Length > 100000)
				return 0;

			int media = 0;

			for (int i = 0; i < A.Length; i++)
			{
				if (A[i] < media)
				{
					//Considerar o proximo número
				}
			}

			return indice;
		}
	}
}
